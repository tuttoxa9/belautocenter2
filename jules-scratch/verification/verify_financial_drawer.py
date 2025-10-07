import re
import time
from playwright.sync_api import sync_playwright, Page, expect

def run_verification(page: Page):
    """
    This test verifies that the new financial assistant drawer opens correctly.
    It dynamically finds a car from the catalog page to ensure the test is robust.
    """
    # 1. Navigate to the catalog page to find a valid car.
    print("Navigating to catalog page...")
    page.goto("http://localhost:3000/catalog", timeout=60000)

    # 2. Find the first car card link and get its href attribute.
    print("Looking for the first car link...")
    # We look for a link that contains '/catalog/' and is within a div that likely represents a car card.
    first_car_link = page.locator("a[href*='/catalog/']").first
    expect(first_car_link).to_be_visible(timeout=20000)

    car_page_url = first_car_link.get_attribute("href")
    if not car_page_url:
        raise Exception("Could not find a car link on the catalog page.")

    print(f"Found car page URL: {car_page_url}")

    # 3. Navigate to the dynamically found car page.
    print(f"Navigating to {car_page_url}...")
    page.goto(f"http://localhost:3000{car_page_url}", timeout=60000)

    # 4. Find and click the button to open the financial assistant drawer.
    # We wait for the button to be visible, which indicates the page has loaded.
    print("Waiting for the financing calculator button...")
    calculate_button = page.get_by_role("button", name=re.compile("Рассчитать кредит/лизинг", re.IGNORECASE))
    expect(calculate_button).to_be_visible(timeout=20000)
    calculate_button.click()
    print("Drawer opened.")

    # 5. Verify the drawer is open and take a screenshot of the default "Credit" view.
    print("Verifying 'Credit' view...")
    drawer_title = page.get_by_role("heading", name="Расчет кредита и лизинга")
    expect(drawer_title).to_be_visible()
    expect(page.get_by_text("Первый взнос")).to_be_visible()

    time.sleep(2) # Allow animations and data to settle.
    page.screenshot(path="jules-scratch/verification/verification-credit.png")
    print("Screenshot for 'Credit' view saved.")

    # 6. Switch to the "Leasing" calculator.
    print("Switching to 'Leasing' view...")
    leasing_tab = page.get_by_role("button", name="Лизинг")
    expect(leasing_tab).to_be_visible()
    leasing_tab.click()

    # 7. Verify the leasing calculator is visible and take a screenshot.
    expect(page.get_by_text("Авансовый платеж")).to_be_visible()
    time.sleep(1) # Allow view to update.
    page.screenshot(path="jules-scratch/verification/verification-leasing.png")
    print("Screenshot for 'Leasing' view saved.")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            run_verification(page)
            print("Verification script completed successfully.")
        except Exception as e:
            print(f"An error occurred during verification: {e}")
            # Take a screenshot on error for debugging
            page.screenshot(path="jules-scratch/verification/error_screenshot.png")
            print("Error screenshot saved.")
        finally:
            browser.close()

if __name__ == "__main__":
    main()