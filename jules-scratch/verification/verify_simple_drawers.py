import re
from playwright.sync_api import sync_playwright, Page, expect

def verify_simple_drawers(page: Page):
    """
    This script verifies drawers that do not depend on complex data loading.
    """
    # 1. Verify "Request Callback" Drawer from Header
    print("Verifying 'Request Callback' Drawer from Header...")
    page.goto("http://localhost:3000/")

    callback_button = page.locator("button:has-text('Заказать звонок')")
    expect(callback_button).to_be_visible(timeout=15000)
    callback_button.click()

    callback_title = page.locator("h2:has-text('Заказать обратный звонок')")
    expect(callback_title).to_be_visible(timeout=10000)
    page.screenshot(path="jules-scratch/verification/01_header_callback_drawer.png")
    print("Header Callback Drawer OK.")
    page.locator('body').press('Escape')
    expect(callback_title).not_to_be_visible()

    # 2. Verify Review Page and Drawer (if possible)
    print("Verifying Review Drawer...")
    page.goto("http://localhost:3000/reviews")

    # Take a screenshot of the page to ensure it loads
    page.screenshot(path="jules-scratch/verification/02_reviews_page.png")
    print("Reviews page loaded.")

    read_more_button = page.locator("text=Читать полностью").first
    # This might fail if no review is long enough, so we handle it gracefully
    if read_more_button.is_visible(timeout=5000):
        read_more_button.click()
        review_title = page.locator("h2:has-text('Отзыв от')")
        expect(review_title).to_be_visible()
        page.screenshot(path="jules-scratch/verification/03_review_drawer.png")
        print("Review Drawer OK.")
    else:
        print("No 'Read More' button found for reviews, skipping that screenshot.")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_simple_drawers(page)
        browser.close()

if __name__ == "__main__":
    main()