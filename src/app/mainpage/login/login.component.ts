import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { environment } from 'src/environments/environment';
import { FormGroup, FormControl, Validators } from '@angular/forms'
import {MessageService} from 'primeng/api';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  captchaKey = environment.recaptchaPublic;
  loading = true;

  loginForm = new FormGroup({
    email:  new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    captchaResponse:  new FormControl('', [Validators.required])
  });



  constructor(
    private loginService: LoginService,
    private messages: MessageService,
    private router: Router

  ) { }

  ngOnInit(): void {
    if(this.loginService.checkUserLoggedIn()) {
      this.router.navigate(['/dashboard']);
    } else {
      setTimeout(()=> {
        this.loading = false;
      }, 1500);
    }
  }

  captchaResolved(ev: any){
    this.loginForm.controls['captchaResponse'].patchValue(ev.response);
  }
  captchaExpired(){
    this.loginForm.controls['captchaResponse'].patchValue(null);
  }

  async onSubmit(){
    this.loading = true;
    try {
      let login = await this.loginService.logIn(this.loginForm);
      if(!login) {
        this.messages.add({severity:'warn', summary:'Login failed', detail:'Check email, passowrd, or if you recived the activation email!'});
      }
    } catch (exception) {
      console.log(exception);
      this.messages.add({severity:'error', summary:'Something failed!', detail:'Something has failed. Check your internet connection or try again later'});

    }
    this.loading = false;
  }

}
