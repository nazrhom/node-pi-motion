#!/usr/bin/python
# Minimal Motion Detection Logic written by Claude Pageau Dec-2014

import time
import signal
import sys
import datetime
import picamera
import picamera.array
from fractions import Fraction
import argparse

# This function is used to validate the color parameter
def parse_color(string):
    colorMap = {'R': 0, 'G': 1, 'B': 2}
    if colorMap.has_key(string):
        return colorMap[string]
    else:
        msg = "%r is not a valid value. Please insert one of R G B" % string
        raise argparse.ArgumentTypeError(msg)

# Handle remote exit of script
def exit_handler(signal, frame):
    sys.exit(0)

# Attach handler to signal
signal.signal(signal.SIGTERM, exit_handler)

parser = argparse.ArgumentParser()
parser.add_argument("-t", "--threshold", type=int, help="How Much a pixel has to change (default: 10)", default=10)
parser.add_argument("-s", "--sensitivity", type=int, help="How Many pixels need to change for motion detection (default: 200)", default=200)
parser.add_argument("-n", "--night", help="Set this if the script is running during the night", action="store_true")
parser.add_argument("-c", "--color", type=parse_color, help="Pixel differences are computed using one of the RGB values for that pixel (defaults: G)", default='G')
parser.add_argument("-z", "--sleep", type=int, help="The time in seconds to wait between two photos (Defaults 1)", default=1)
args = parser.parse_args()

#Constants
SECONDS2MICRO = 1000000         # Constant for converting Shutter Speed in Seconds to Microseconds

verbose = True			        # Display showMessage if True
threshold = args.threshold      # How Much a pixel has to change
sensitivity = args.sensitivity  # How Many pixels need to change for motion detection
pixColor = args.color           # red=0 green=1 blue=2
sleep = args.sleep              # Time between photos comparisons (in seconds)

nightShut = 5.5   	            # seconds Night shutter Exposure Time default = 5.5  Do not exceed 6 since camera may lock up
nightISO = 800

testWidth = 100
testHeight = 75
if nightShut > 6:
    nightShut = 5.9
nightMaxShut = int(nightShut * SECONDS2MICRO)
nightMaxISO = int(nightISO)
nightSleepSec = 10

def userMotionCode():
    # Users can put code here that needs to be run prior to taking motion capture images
    # Eg Notify or activate something.
    # User code goes here
    eventStr = "DetectedMotion"

    print eventStr

    # Show eventStr for debugging
    showMessage("userMotionCode",eventStr)
    return

def showTime():
    rightNow = datetime.datetime.now()
    currentTime = "%04d%02d%02d-%02d:%02d:%02d" % (rightNow.year, rightNow.month, rightNow.day, rightNow.hour, rightNow.minute, rightNow.second)
    return currentTime

def showMessage(functionName, messageStr):
    if verbose:
        now = showTime()
        print ("%s %s - %s " % (now, functionName, messageStr))
    return

def checkForMotion(data1, data2):
    # Find motion between two data streams based on sensitivity and threshold
    motionDetected = False
    pixChanges = 0;
    for w in range(0, testWidth):
        for h in range(0, testHeight):
            # get the diff of the pixel. Conversion to int
            # is required to avoid unsigned short overflow.
            pixDiff = abs(int(data1[h][w][pixColor]) - int(data2[h][w][pixColor]))
            if  pixDiff > threshold:
                pixChanges += 1
            if pixChanges > sensitivity:
                break; # break inner loop
        if pixChanges > sensitivity:
            break; #break outer loop.
    if pixChanges > sensitivity:
        motionDetected = True
    return motionDetected

def getStreamImage(daymode):
    # Capture an image stream to memory based on daymode
    isDay = daymode
    with picamera.PiCamera() as camera:
        time.sleep(1)
        camera.resolution = (testWidth, testHeight)
        with picamera.array.PiRGBArray(camera) as stream:
            if isDay:
                camera.exposure_mode = 'auto'
                camera.awb_mode = 'auto'
            else:
                # Take Low Light image
                # Set a framerate of 1/6fps, then set shutter
                # speed to 6s and ISO to 800
                camera.framerate = Fraction(1, 6)
                camera.shutter_speed = nightMaxShut
                camera.exposure_mode = 'off'
                camera.iso = nightMaxISO
                # Give the camera a good long time to measure AWB
                # (you may wish to use fixed AWB instead)
                time.sleep( nightSleepSec )
            camera.capture(stream, format='rgb')
            return stream.array

def Main():
    greetingStr = "Starting pi-motion-lite"
    showMessage("Main", greetingStr);
    dayTime = not args.night
    msgStr = "Checking for Motion dayTime=%s threshold=%i sensitivity=%i" % (dayTime, threshold, sensitivity)
    showMessage("Main", msgStr)
    stream1 = getStreamImage(dayTime)

    # Signal node that detection is starting
    rdyStr = 'ready-%i' % sleep
    print rdyStr

    while True:
        stream2 = getStreamImage(dayTime)
        if checkForMotion(stream1, stream2):
            userMotionCode()
        stream1 = stream2
    return

if __name__ == '__main__':
    try:
        Main()
    finally:
        print("")
        print("+++++++++++++++++++")
        print("  Exiting Program")
        print("+++++++++++++++++++")
        print("")
