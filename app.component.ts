import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthModalComponent } from './components/auth-modal/auth-modal.component';
import { HeaderComponent } from './components/header/header.component';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { ReservationComponent } from './components/reservation/reservation.component';
import { ProfileSettingsComponent } from './components/profile-settings/profile-settings.component';
import { OrderTrackingComponent } from './components/order-tracking/order-tracking.component';
import { ChatComponent } from './components/chat/chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AuthModalComponent, HeaderComponent, CartComponent, CheckoutComponent, ReservationComponent, ProfileSettingsComponent, OrderTrackingComponent, ChatComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'dream-city-restaurant';
}