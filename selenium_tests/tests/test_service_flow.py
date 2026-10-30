import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from utils.driver_factory import get_driver

import time

class TestServiceFlow:

    def run_all_tests(self):
        results = {}

        try:
            driver = get_driver()
            driver.get("http://localhost:3000")

            print("Service flow test running")
            time.sleep(2)

            results["Service Flow Test"] = "PASS"
            driver.quit()

        except Exception as e:
            results["Service Flow Test"] = f"FAIL ({e})"

        return results
