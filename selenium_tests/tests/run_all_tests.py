from test_login import TestLogin
from test_service_flow import TestServiceFlow

def main():
    print("\n" + "=" * 80)
    print("        SERVICEHUB APPLICATION")
    print("        SELENIUM TEST SUITE")
    print("=" * 80)

    all_results = {}

    print("\n[1/2] Running Login Tests...")
    print("-" * 80)
    login = TestLogin()
    all_results["Login"] = login.run_all_tests()

    print("\n[2/2] Running Service Flow Tests...")
    print("-" * 80)
    service = TestServiceFlow()
    all_results["Service"] = service.run_all_tests()

    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)

    for module, results in all_results.items():
        for test, status in results.items():
            print(f"{module} → {test}: {status}")

if __name__ == "__main__":
    main()
