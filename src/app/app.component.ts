import { LoginComponent } from './components/login/login.component';
import { DefaultDataService } from './shared/services/default-data.service';
import { WorkspaceService } from 'src/app/shared/services/workspace.service';
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
import { Channel } from 'src/app/models/channel';

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
    private zone: NgZone,
    private workspaceService: WorkspaceService,
    private defaultDataService: DefaultDataService
  ) {
    this.auth.getGoogleUserData();
  }

  ngOnInit() {
    this.setBodyBgColor();
    this.resetBodyOverflow();
    this.checkUserLoggedWhenNewRoute();
    this.setAnimationContainer();
  }

  /**
   * Sets the background color of the body based on the current route.
   * @returns {void}
   */
  setBodyBgColor() {
    const currentRoute = this.router.url;
    if (currentRoute.includes('google-screen')) {
      document.body.style.backgroundColor = '#fff';
    } else {
      document.body.style.backgroundColor = '#eceefe';
    }
  }

  /**
   * Resets the overflow style of the body.
   * @returns {void}
   */
  resetBodyOverflow() {
    document.body.style.overflow = 'unset';
  }

  /**
   * Checks if a user is logged in when a new route is navigated to.
   * @returns {void}
   */
  checkUserLoggedWhenNewRoute() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.auth.checkIfUserIslogged();
        this.checkIfNewUser();
      }
    });
  }

  /**
   * Sets the style of the body viewport height based on emailWasSent and newUserSuccess flags.
   * @param {boolean} emailWasSent - Flag indicating if an email was sent.
   * @param {boolean} newUserSuccess - Flag indicating if a new user was successfully registered.
   * @returns {void}
   */
  setAnimationContainer() {
    this.animationsSubscription = combineLatest([
      this.animations.emailWasSent$,
      this.animations.newUserSuccess$,
    ]).subscribe(([emailWasSent, newUserSuccess]) => {
      this.setStyleBodyViewportHeight(emailWasSent, newUserSuccess);
    });
  }

  /**
   * Unsubscribes from the animationsSubscription to prevent memory leaks.
   * @returns {void}
   */
  ngOnDestroy() {
    this.animationsSubscription.unsubscribe();
  }

  /**
   * Sets the style of the body viewport height based on emailWasSent and newUserSuccess flags.
   * @param {boolean} emailWasSent - Flag indicating if an email was sent.
   * @param {boolean} newUserSuccess - Flag indicating if a new user was successfully registered.
   * @returns {void}
   */
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

  /**
   * Checks if the current user is a new user based on the number of channels logged in.
   * If the user is new, creates default channels.
   * @returns {void}
   */
  checkIfNewUser() {
    const currentRoute = this.router.url;
    if (currentRoute.includes('dashboard')) {
      const channelsLoggedUser = this.workspaceService.getChannels().length;
      if (this.newUser(channelsLoggedUser)) {
        this.defaultDataService.createDefaultChannels();
      }
    }
  }

  /**
   * Checks if a user is new based on the number of channels logged in.
   * @param {number} channelsLoggedUser - The number of channels logged in.
   * @returns {boolean} True if the user is new, otherwise false.
   */
  newUser(channelsLoggedUser: number) {
    return channelsLoggedUser === 0;
  }
}
