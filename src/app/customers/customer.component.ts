import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';

import { Customer } from './customer';

function emailMatcher(c: AbstractControl): { [key: string]: boolean } | null {
  const emailControl = c.get('email')
  const confirmControl = c.get('confirmEmail')

  if(emailControl.pristine || confirmControl.pristine) {
    return null
  }

  if(emailControl.value === confirmControl.value) {
    return null
  }
  return { 'match': true }
}

function ratingRange(min: number, max: number): ValidatorFn {
  //AbstractControl allows a formControl or FormGroup to be received
  return (c: AbstractControl): { [key: string]: boolean } | null => {
    if (c.value !== null && (isNaN(c.value) || c.value < min || c.value > max)) {
      return { 'range': true } //case invalid, true to add to the list of validation errors
    }
    return null //case valid, return null
  }
}

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  customerForm: FormGroup
  customer = new Customer();

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      emailGroup: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        confirmEmail: ['', Validators.required],
      }, {validator: emailMatcher}),      
      phone: '',
      notification: 'email',
      rating: [null, ratingRange(1, 5)],
      sendCatalog: true
    })

    this.customerForm.get('notification').valueChanges.subscribe(
      value => this.setNotification(value)
    )
  }

  populateTestDataSet(): void {
    this.customerForm.setValue({
      firstName: 'Jack',
      lastName: 'Harkness',
      email: 'jack@torchwood.com',
      sendCatalog: false
    })
  }

  populateTestDataPatch(): void {
    this.customerForm.patchValue({
      firstName: 'Jack',
      lastName: 'Harkness',
      sendCatalog: false
    })
  }

  save(): void {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }

  setNotification(notifyVia: string): void {
    const phoneControl = this.customerForm.get('phone')
    if (notifyVia === 'text') {
      phoneControl.setValidators(Validators.required)
    } else {
      phoneControl.clearValidators()
    }
    phoneControl.updateValueAndValidity()
  }
}
