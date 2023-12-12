import { FormControl, FormGroup, Validators } from "@angular/forms";

export function getProfileSettingsForm() {
    return new FormGroup({
        darkMode: new FormControl(false, [Validators.required]),
        syncDarkMode: new FormControl(false, [Validators.required]),
        fullName: new FormControl('', [Validators.required]),
    })
}

export function getExpenseSettingsForm() {
    return new FormGroup({
        currency: new FormControl('', [Validators.required]),
        language: new FormControl('', [Validators.required]),
    })
}