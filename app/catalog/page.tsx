import CatalogClient from './catalog-client'

// Полностью статическая страница без серверных компонентов
export default function CatalogPage() {
  // Передаем пустой массив, данные будут загружены на клиенте
  return <CatalogClient initialCars={[]} />
}
