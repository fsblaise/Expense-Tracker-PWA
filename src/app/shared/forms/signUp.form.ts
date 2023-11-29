
import { FormControl, FormGroup, Validators } from "@angular/forms";

export function getSignUpForm() {
    return new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email]),
        fullName: new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required, Validators.minLength(6)]),
        rePassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    })
}