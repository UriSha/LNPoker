import os
import subprocess

if __name__ == '__main__':
    subprocess.Popen("python player/player_web.py 1", shell=True)
    subprocess.Popen("python player/player_web.py 2", shell=True)
    subprocess.Popen("python player/player_web.py 3", shell=True)

    # my_env = os.environ.copy()
    my_env = os.environ.update({'REDIS_URL': '127.0.0.1:6379'})
    subprocess.Popen("python texasholdem_poker_service.py", env=my_env, shell=True)

    subprocess.Popen("python client_web.py", shell=True)
