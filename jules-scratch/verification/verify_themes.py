import asyncio
from playwright.async_api import async_playwright, expect
from PIL import Image

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        await page.goto("http://0.0.0.0:3000", wait_until="networkidle")
        await page.set_viewport_size({"width": 1280, "height": 720})

        # --- Desktop Verification ---

        # 1. Light Theme (Default)
        await page.wait_for_timeout(1000) # Wait for hydration
        await page.screenshot(path="jules-scratch/verification/desktop-light.png")

        # 2. Open dropdown and switch to Dark Theme
        theme_button = page.locator('header').get_by_role("button", name="Toggle theme")
        await theme_button.click()
        await page.wait_for_timeout(500) # Wait for dropdown animation

        dark_item = page.get_by_role("menuitem", name="Dark")
        await dark_item.click()
        await expect(page.locator("html")).to_have_attribute("class", "dark", timeout=5000)
        await page.wait_for_timeout(500)
        await page.screenshot(path="jules-scratch/verification/desktop-dark.png")

        # 3. Open dropdown and switch to Amoled Theme
        await theme_button.click()
        await page.wait_for_timeout(500)
        amoled_item = page.get_by_role("menuitem", name="Amoled")
        await amoled_item.click()
        await expect(page.locator("html")).to_have_attribute("class", "amoled")
        await page.wait_for_timeout(500)
        await page.screenshot(path="jules-scratch/verification/desktop-amoled.png")

        # --- Mobile Verification ---
        await page.set_viewport_size({"width": 375, "height": 812})

        # 4. Open dropdown and switch to Amoled Theme on Mobile
        mobile_theme_button = page.locator('.fixed.bottom-4').get_by_role("button", name="Toggle theme")
        await mobile_theme_button.click()
        await page.wait_for_timeout(500)

        mobile_amoled_item = page.get_by_role("menuitem", name="Amoled")
        await mobile_amoled_item.click()
        await expect(page.locator("html")).to_have_attribute("class", "amoled")
        await page.wait_for_timeout(500)
        await page.screenshot(path="jules-scratch/verification/mobile-amoled.png")

        await browser.close()

    # --- Combine screenshots ---
    images = [
        Image.open("jules-scratch/verification/desktop-light.png"),
        Image.open("jules-scratch/verification/desktop-dark.png"),
        Image.open("jules-scratch/verification/desktop-amoled.png"),
        Image.open("jules-scratch/verification/mobile-amoled.png")
    ]

    widths, heights = zip(*(i.size for i in images))
    total_width = sum(widths)
    max_height = max(heights)

    combined_image = Image.new('RGB', (total_width, max_height))

    x_offset = 0
    for im in images:
        combined_image.paste(im, (x_offset,0))
        x_offset += im.size[0]

    combined_image.save("jules-scratch/verification/combined.png")

asyncio.run(main())