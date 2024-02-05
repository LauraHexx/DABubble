import { WorkspaceService } from 'src/app/shared/services/workspace.service';
import { HeaderComponent } from './components/dashboard/header/header.component';
import { NgModule } from '@angular/core';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SideLeftComponent } from './components/dashboard/side-left/side-left.component';
import { SideRightComponent } from './components/dashboard/side-right/side-right.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ChannelComponent } from './components-sub/channel/channel.component';
import { MessageComponent } from './components-sub/message/message.component';
import { LoginComponent } from './components/login/login.component';
import { DisplayLoginComponent } from './components/login/display-login/display-login.component';
import { DisplayCreateAccountComponent } from './components/login/display-create-account/display-create-account.component';
import { DisplayChooseAvatarComponent } from './components/login/display-choose-avatar/display-choose-avatar.component';
import { DisplayResetPwEnterEmailComponent } from './components/login/display-reset-pw-enter-email/display-reset-pw-enter-email.component';
import { DisplayResetPwEnterPwComponent } from './components/login/display-reset-pw-enter-pw/display-reset-pw-enter-pw.component';
import { PrivacyPolicyComponent } from './components/login/privacy-policy/privacy-policy.component';
import { CreateChannelComponent } from './components-sub/create-channel/create-channel.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImprintComponent } from './components/login/imprint/imprint.component';
import { InputFieldChannelComponent } from './components-sub/input-field-channel/input-field-channel.component';
import { InputFieldThreadComponent } from './components-sub/input-field-thread/input-field-thread.component';
import { InputFieldMessageComponent } from './components-sub/input-field-message/input-field-message.component';
import { NewMessageComponent } from './components-sub/new-message/new-message.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiPickerComponent } from './components-sub/emoji-picker/emoji-picker.component';
import { MessagesChannelComponent } from './components-sub/messages-channel/messages-channel.component';
import { MessageOfUserComponent } from './components-sub/message-of-user/message-of-user.component';
import { MessageReactionComponent } from './components-sub/message-reaction/message-reaction.component';
import { getStorage, provideStorage } from '@angular/fire/storage';

import { MobileHeaderComponent } from './components-sub/mobile-header/mobile-header.component';
import { SettingsUserMenuComponent } from './components-sub/settings-user-menu/settings-user-menu.component';
import { SettingsUserDataComponent } from './components-sub/settings-user-data/settings-user-data.component';
import { SettingsEditUserDataComponent } from './components-sub/settings-edit-user-data/settings-edit-user-data.component';
import { SettingsUserDataMessageComponent } from './components-sub/settings-user-data-message/settings-user-data-message.component';
import { WorkspacebuttonComponent } from './components-sub/workspacebutton/workspacebutton.component';
import { GoogleScreenComponent } from './components/login/google-screen/google-screen.component';

@NgModule({
  declarations: [
    AppComponent,
    SideLeftComponent,
    SideRightComponent,
    HeaderComponent,
    DashboardComponent,
    CreateChannelComponent,
    ChannelComponent,
    MessageComponent,
    LoginComponent,
    DisplayLoginComponent,
    DisplayCreateAccountComponent,
    DisplayChooseAvatarComponent,
    DisplayResetPwEnterEmailComponent,
    DisplayResetPwEnterPwComponent,
    PrivacyPolicyComponent,
    ImprintComponent,
    InputFieldChannelComponent,
    InputFieldThreadComponent,
    InputFieldMessageComponent,
    NewMessageComponent,
    EmojiPickerComponent,
    MessagesChannelComponent,
    MessageOfUserComponent,
    MessageReactionComponent,
    WorkspacebuttonComponent,
    MobileHeaderComponent,
    SettingsUserMenuComponent,
    SettingsUserDataComponent,
    SettingsEditUserDataComponent,
    SettingsUserDataMessageComponent,
    GoogleScreenComponent,

    // PickerComponent,
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    PickerModule,
    FormsModule,
    ReactiveFormsModule,
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: 'AIzaSyCbiTC1qyjpxXwcCBW2zo0h2fBtbyreN-Y',
        authDomain: 'dabubble-1fa5e.firebaseapp.com',
        projectId: 'dabubble-1fa5e',
        storageBucket: 'dabubble-1fa5e.appspot.com',
        messagingSenderId: '443674511916',
        appId: '1:443674511916:web:481bf8b2c7794154005f89',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
