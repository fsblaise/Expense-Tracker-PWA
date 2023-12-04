import { FormControl, FormGroup, Validators } from "@angular/forms";

export function getAddExpenseForm() {
    return new FormGroup({
        storeName: new FormControl('', [Validators.required]),
        amount: new FormControl('', [Validators.required]),
    })
}