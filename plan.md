1. **Remove residual value from leasing calculator in `app/catalog/[id]/car-details-client.tsx`**:
   - Find where `residualValue` state is defined and used.
   - Remove the input field for "Остаток (%)".
   - Update `calculateLeasingPayment` function to not subtract `residualVal`.
   - Remove "Остаточная" and "Остаточная %" from the details breakdown.
   - Ensure `monthlyPayment` takes into account if currency is BYN and uses USDBYNrate.

2. **Remove residual value from leasing calculator in `components/FinancialAssistantDrawer.tsx`**:
   - Remove `residualValue` state.
   - Update the leasing sum calculation in `getLeasingPayment` / `calculateLeasingPayment`.
   - Remove the slider for "Остаточная стоимость".
   - Remove the detail for "Остаточная стоимость".

3. **Pre-commit tasks**:
   - Run tests and verifications before submitting.
