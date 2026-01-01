
import os
import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 375, 'height': 812}, # Mobile viewport
            color_scheme='light' # Force light mode
        )
        page = await context.new_page()

        print("Starting navigation...")
        try:
             await page.goto("http://localhost:3000/warranty", timeout=30000)
        except Exception as e:
             print(f"Server not accessible: {e}")
             await browser.close()
             return

        # Wait for hydration
        await page.wait_for_timeout(3000)

        # Take screenshot
        await page.screenshot(path="warranty_mobile_before.png", full_page=True)
        print("Screenshot saved to warranty_mobile_before.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
