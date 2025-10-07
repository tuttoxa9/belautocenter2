import re
from playwright.sync_api import sync_playwright, expect, Page
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # --- 1. Проверка страницы каталога ---
    print("Navigating to http://localhost:3000/catalog")
    page.goto("http://localhost:3000/catalog", timeout=60000)

    # Ждем, пока загрузится заголовок и хотя бы одна карточка
    expect(page.get_by_role("heading", name="Каталог автомобилей")).to_be_visible(timeout=20000)
    expect(page.locator('.grid > div > a').first).to_be_visible(timeout=20000)

    print("Taking screenshot of initial catalog page...")
    page.screenshot(path="jules-scratch/verification/01_catalog_initial.png")

    # --- 2. Проверка фильтрации ---
    print("Applying a filter...")

    # Открываем выпадающий список марок
    make_selector = page.get_by_role("combobox").first
    expect(make_selector).to_be_enabled(timeout=10000)
    make_selector.click()

    # Выбираем первую доступную марку (не "Все марки")
    # Используем get_by_role для надежности
    first_make = page.get_by_role("option").nth(1)
    make_name = first_make.inner_text()
    print(f"Selecting make: {make_name}")
    first_make.click()

    # Нажимаем кнопку "Применить"
    apply_button = page.get_by_role("button", name="Применить фильтры")
    expect(apply_button).to_be_enabled()
    apply_button.click()

    # Ждем, пока URL обновится и исчезнет индикатор загрузки
    print("Waiting for filter application...")
    expect(page).to_have_url(re.compile(r"make="), timeout=15000)
    # Ждем, пока карточки обновятся
    expect(page.locator('.grid > div > a').first).to_be_visible(timeout=15000)

    print("Taking screenshot of filtered catalog page...")
    page.screenshot(path="jules-scratch/verification/02_catalog_filtered.png")

    # --- 3. Проверка страницы детального просмотра ---
    print("Navigating to the first car details page...")

    # Находим первую карточку и кликаем на нее
    first_car_card = page.locator('.grid > div > a').first
    first_car_link = first_car_card.get_attribute("href")
    print(f"Clicking on car: {first_car_link}")
    first_car_card.click()

    # Ждем загрузки страницы детального просмотра
    expect(page).to_have_url(re.compile(first_car_link), timeout=15000)
    # Проверяем наличие заголовка, который зависит от загруженных данных
    expect(page.get_by_role("heading", level=1).first).to_be_visible(timeout=15000)

    print("Taking screenshot of car details page...")
    page.screenshot(path="jules-scratch/verification/03_car_details_optimized.png")

    print("Verification script finished successfully.")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)