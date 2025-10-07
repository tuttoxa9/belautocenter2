import re
from playwright.sync_api import sync_playwright, Page, expect

def verify_all_drawers(page: Page):
    """
    This script verifies that all refactored modals now open correctly as drawers.
    """
    # 1. Verify Financial Assistant Drawer
    print("Verifying Financial Assistant Drawer...")
    page.goto("http://localhost:3000/catalog")
    # Click the first car card to navigate to details page
    expect(page.locator('.card-container').first).to_be_visible(timeout=20000)
    page.locator('.card-container').first.click()

    # Wait for the details page to load and find the calculator button
    calc_button = page.locator("button:has-text('Рассчитать кредит/лизинг')")
    expect(calc_button).to_be_visible(timeout=15000)
    calc_button.click()

    # Check if the Financial Assistant Drawer is open
    assistant_title = page.locator("h2:has-text('Расчет кредита и лизинга')")
    expect(assistant_title).to_be_visible(timeout=10000)
    page.screenshot(path="jules-scratch/verification/01_financial_assistant.png")
    print("Financial Assistant OK.")
    # Close the drawer
    page.locator('body').press('Escape')
    expect(assistant_title).not_to_be_visible()

    # 2. Verify Book Viewing Drawer
    print("Verifying Book Viewing Drawer...")
    booking_button = page.locator("button:has-text('Записаться на просмотр')")
    expect(booking_button).to_be_visible()
    booking_button.click()

    booking_title = page.locator("h2:has-text('Записаться на просмотр')")
    expect(booking_title).to_be_visible()
    page.screenshot(path="jules-scratch/verification/02_booking_drawer.png")
    print("Booking Drawer OK.")
    page.locator('body').press('Escape')
    expect(booking_title).not_to_be_visible()

    # 3. Verify Mobile Filter Drawer
    print("Verifying Mobile Filter Drawer...")
    page.set_viewport_size({"width": 375, "height": 667})
    page.goto("http://localhost:3000/catalog")

    filter_button = page.locator("button:has-text('Фильтры')")
    expect(filter_button).to_be_visible(timeout=15000)
    filter_button.click()

    filter_title = page.locator("h2:has-text('Фильтры поиска')")
    expect(filter_title).to_be_visible()
    page.screenshot(path="jules-scratch/verification/03_mobile_filter.png")
    print("Mobile Filter OK.")
    page.locator('body').press('Escape')
    expect(filter_title).not_to_be_visible()

    # Reset viewport to desktop
    page.set_viewport_size({"width": 1280, "height": 720})

    # 4. Verify Review Drawer
    print("Verifying Review Drawer...")
    page.goto("http://localhost:3000/reviews")

    read_more_button = page.locator("text=Читать полностью").first
    # This might fail if no review is long enough, so we handle it gracefully
    if read_more_button.is_visible():
        read_more_button.click()
        review_title = page.locator("h2:has-text('Отзыв от')")
        expect(review_title).to_be_visible()
        page.screenshot(path="jules-scratch/verification/04_review_drawer.png")
        print("Review Drawer OK.")
    else:
        print("No 'Read More' button found for reviews, skipping screenshot.")
        # Create a placeholder screenshot to show the reviews page
        page.screenshot(path="jules-scratch/verification/04_review_page.png")


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_all_drawers(page)
        browser.close()

if __name__ == "__main__":
    main()