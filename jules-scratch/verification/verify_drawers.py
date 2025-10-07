import time
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(
        viewport={"width": 1280, "height": 1024},
        device_scale_factor=1,
    )
    page = context.new_page()

    try:
        # --- Проверка на странице автомобиля ---
        print("Navigating to catalog page...")
        page.goto("http://localhost:3000/catalog", timeout=60000)

        # Ждем загрузки и кликаем на первую машину
        print("Waiting for car card to be visible...")
        first_car_card = page.locator(".car-card-link").first
        expect(first_car_card).to_be_visible(timeout=30000)
        first_car_card.click()

        page.wait_for_url("**/catalog/**", timeout=30000)
        print(f"Navigated to car details page: {page.url}")

        # Проверка "Записаться на просмотр"
        print("Testing 'Book Viewing' drawer...")
        book_viewing_button = page.get_by_role("button", name="Записаться на просмотр")
        expect(book_viewing_button).to_be_visible(timeout=15000)
        book_viewing_button.click()

        # Ждем появления панели
        book_drawer = page.locator('.universal-drawer-content')
        expect(book_drawer).to_be_visible(timeout=10000)
        time.sleep(1) # Ждем завершения анимации
        page.screenshot(path="jules-scratch/verification/01_book_viewing_drawer.png")
        print("Screenshot for 'Book Viewing' drawer taken.")

        # Закрываем панель кликом на оверлей
        page.locator(".universal-drawer-overlay").click()
        expect(book_drawer).not_to_be_visible(timeout=10000)

        # Проверка "Заказать звонок"
        print("Testing 'Callback' drawer...")
        callback_button = page.get_by_role("button", name="Заказать звонок")
        expect(callback_button).to_be_visible(timeout=10000)
        callback_button.click()

        callback_drawer = page.locator('.universal-drawer-content')
        expect(callback_drawer).to_be_visible(timeout=10000)
        time.sleep(1)
        page.screenshot(path="jules-scratch/verification/02_callback_drawer.png")
        print("Screenshot for 'Callback' drawer taken.")

        # Закрываем панель
        page.locator(".universal-drawer-overlay").click()
        expect(callback_drawer).not_to_be_visible(timeout=10000)

        # --- Проверка на странице отзывов ---
        print("Navigating to reviews page...")
        page.goto("http://localhost:3000/reviews", timeout=60000)

        # Кликаем на первый отзыв
        print("Waiting for review card to be visible...")
        first_review_card = page.locator(".review-card").first
        expect(first_review_card).to_be_visible(timeout=30000)
        first_review_card.click()

        review_drawer = page.locator('.universal-drawer-content')
        expect(review_drawer).to_be_visible(timeout=10000)
        time.sleep(1)
        page.screenshot(path="jules-scratch/verification/03_review_drawer.png")
        print("Screenshot for 'Review' drawer taken.")

    except Exception as e:
        print(f"An error occurred: {e}")
        # Сохраняем HTML для отладки
        html_content = page.content()
        with open("jules-scratch/verification/error_page.html", "w", encoding="utf-8") as f:
            f.write(html_content)
        print("Saved error page HTML to jules-scratch/verification/error_page.html")
        page.screenshot(path="jules-scratch/verification/error.png")
    finally:
        browser.close()

with sync_playwright() as p:
    run_verification(p)