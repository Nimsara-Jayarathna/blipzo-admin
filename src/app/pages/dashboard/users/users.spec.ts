import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UsersService } from '../../../core/users/users.service';

import { Users } from './users';

describe('Users', () => {
  let component: Users;
  let fixture: ComponentFixture<Users>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Users],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getUsers: () =>
              of({
                users: [
                  {
                    id: '1001',
                    name: 'Johnathan Doe',
                    email: 'j.doe@example.com',
                    status: 'ACTIVE',
                  },
                ],
                total: 1,
              }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Users);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply client pagination with configurable page size', () => {
    expect(component.pageSize).toBe(10);
    expect(component.filteredUsers.length).toBe(1);
    expect(component.pagedUsers.length).toBe(1);
    expect(component.showPagination).toBe(false);
  });
});
