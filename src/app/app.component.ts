import { UserService } from 'src/app/shared/services/user.service';
import { AnimationsService } from 'src/app/shared/services/animations.service';
import { Router, NavigationEnd } from '@angular/router';
import { AuthenticationService } from './shared/services/authentication.service';
import {
  Component,
  Renderer2,
  ElementRef,
  NgZone,
  HostListener,
} from '@angular/core';
import { Subscription, combineLatest } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'DABubble';
  private animationsSubscription: Subscription = new Subscription();

  constructor(
    private auth: AuthenticationService,
    public router: Router,
    private userService: UserService,
    public animations: AnimationsService,
    private renderer: Renderer2,
    private el: ElementRef,
    private zone: NgZone
  ) {
    this.auth.getGoogleUserData();
  }

  ngOnInit() {
    this.setBodyBgColor();
    this.resetBodyOverflow();
    this.checkUserLoggedWhenNewRoute();
    this.setAnimationContainer();
  }

  setBodyBgColor() {
    const currentRoute = this.router.url;
    if (currentRoute.includes('google-screen')) {
      document.body.style.backgroundColor = '#fff';
    } else {
      document.body.style.backgroundColor = '#eceefe';
    }
  }

  resetBodyOverflow() {
    document.body.style.overflow = 'unset';
  }

  checkUserLoggedWhenNewRoute() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.auth.checkIfUserIslogged();
      }
    });
  }

  setAnimationContainer() {
    this.animationsSubscription = combineLatest([
      this.animations.emailWasSent$,
      this.animations.newUserSuccess$,
    ]).subscribe(([emailWasSent, newUserSuccess]) => {
      this.setStyleBodyViewportHeight(emailWasSent, newUserSuccess);
    });
  }

  ngOnDestroy() {
    this.animationsSubscription.unsubscribe();
  }

  setStyleBodyViewportHeight(emailWasSent: boolean, newUserSuccess: boolean) {
    const container = this.el.nativeElement.querySelector('.overlay-container');
    const viewportHeight = window.innerHeight;
    if (container && (emailWasSent || newUserSuccess)) {
      this.zone.run(() => {
        this.renderer.setStyle(container, 'top', 0);
        this.renderer.setStyle(container, 'left', 0);
        this.renderer.setStyle(container, 'right', 0);
        this.renderer.setStyle(container, 'bottom', -viewportHeight + 'px');
        this.renderer.setStyle(container, 'zIndex', 20);
      });
    }
  }
}
