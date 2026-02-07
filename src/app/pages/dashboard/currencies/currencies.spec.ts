import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CurrenciesService } from '../../../core/currencies/currencies.service';

import { Currencies } from './currencies';

describe('Currencies', () => {
  let component: Currencies;
  let fixture: ComponentFixture<Currencies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Currencies],
      providers: [
        {
          provide: CurrenciesService,
          useValue: {
            getCurrencies: () =>
              of({
                currencies: [
                  {
                    id: 'cur-usd',
                    code: 'USD',
                    name: 'US Dollar',
                    symbol: '$',
                    isActive: true,
                    isDefault: true,
                    status: 'DEFAULT',
                  },
                ],
                total: 1,
              }),
            getCurrencyById: () =>
              of({
                id: 'cur-usd',
                code: 'USD',
                name: 'US Dollar',
                symbol: '$',
                isActive: true,
                isDefault: true,
                status: 'DEFAULT',
              }),
            createCurrency: () =>
              of({
                id: 'cur-usd',
                code: 'USD',
                name: 'US Dollar',
                symbol: '$',
                isActive: true,
                isDefault: true,
                status: 'DEFAULT',
              }),
            updateCurrency: () =>
              of({
                id: 'cur-usd',
                code: 'USD',
                name: 'US Dollar',
                symbol: '$',
                isActive: true,
                isDefault: true,
                status: 'DEFAULT',
              }),
            setDefault: () =>
              of({
                id: 'cur-usd',
                code: 'USD',
                name: 'US Dollar',
                symbol: '$',
                isActive: true,
                isDefault: true,
                status: 'DEFAULT',
              }),
            toggleStatus: () =>
              of({
                id: 'cur-usd',
                code: 'USD',
                name: 'US Dollar',
                symbol: '$',
                isActive: true,
                isDefault: true,
                status: 'DEFAULT',
              }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Currencies);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
