import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 1024})

        print("Navigating to car page...")
        await page.goto("http://localhost:3000/catalog/qv2EuxryYHgebipXHEUC", wait_until="domcontentloaded")

        # Wait a bit for the client side rendering
        await page.wait_for_timeout(3000)

        print("Clicking 'Рассчитать кредит/лизинг' button...")
        # The button has text "Рассчитать кредит/лизинг"
        button = page.locator("button:has-text('Рассчитать кредит/лизинг')").first
        await button.click()

        # Wait for the modal/drawer to open
        await page.wait_for_timeout(2000)

        print("Checking for 'Лизинг' tab inside the modal...")
        # Try to click the "Лизинг" tab if it exists
        leasing_tab = page.locator("button[role='tab']:has-text('Лизинг')").first
        if await leasing_tab.count() > 0:
            await leasing_tab.click()
            await page.wait_for_timeout(1000)

        print("Taking screenshot of the modal...")
        await page.screenshot(path="/home/jules/verification/car_details_modal.png")
        print("Saved to /home/jules/verification/car_details_modal.png")

        await browser.close()

asyncio.run(main())
