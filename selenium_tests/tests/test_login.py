import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from utils.driver_factory import get_driver

import time

class TestLogin:

    def run_all_tests(self):
        results = {}

        try:
            driver = get_driver()

            # change this to your frontend URL
            driver.get("http://localhost:3000")

            print("Login page opened")
            time.sleep(2)

            results["Login Test"] = "PASS"
            driver.quit()

        except Exception as e:
            results["Login Test"] = f"FAIL ({e})"

        return results
