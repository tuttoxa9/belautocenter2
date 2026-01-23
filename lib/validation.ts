export const isPhoneValid = (phone: string) => {
  return phone.length === 13 && phone.startsWith("+375")
}

export const formatPhoneNumber = (value: string) => {
  // Удаляем все нецифровые символы кроме +
  let numbers = value.replace(/[^\d+]/g, "")

  // Если нет + в начале, добавляем +375
  if (!numbers.startsWith("+375")) {
    numbers = "+375"
  }

  // Берем только +375 и следующие 9 цифр максимум
  const prefix = "+375"
  const afterPrefix = numbers.slice(4).replace(/\D/g, "").slice(0, 9)

  return prefix + afterPrefix
}
