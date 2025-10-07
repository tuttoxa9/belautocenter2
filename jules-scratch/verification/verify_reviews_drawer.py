import re
from playwright.sync_api import sync_playwright, Page, expect

def verify_reviews_drawer(page: Page):
    """
    This test verifies that clicking the 'Читать полностью' button on the reviews page
    opens the UniversalDrawer with the full review text.
    """
    # 1. Arrange: Go to the reviews page.
    page.goto("http://localhost:3000/reviews")

    # Wait for the reviews to load by looking for the first review card.
    expect(page.locator("text=Читать полностью").first).to_be_visible(timeout=15000)

    # 2. Act: Find the first "Читать полностью" button and click it.
    read_more_button = page.locator("text=Читать полностью").first
    read_more_button.click()

    # 3. Assert: Confirm the UniversalDrawer is open and visible.
    # We expect the drawer to have the title "Отзыв от...".
    drawer_title = page.locator("h2:has-text('Отзыв от')")
    expect(drawer_title).to_be_visible(timeout=10000)

    # 4. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/reviews_drawer.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_reviews_drawer(page)
        browser.close()

if __name__ == "__main__":
    main()