import pexpect
import sys

child = pexpect.spawn('eas build -p ios -e production --clear-credentials', encoding='utf-8', timeout=10)
child.logfile = sys.stdout
try:
    child.expect('Which credentials do you want to clear')
except Exception as e:
    print(e)
