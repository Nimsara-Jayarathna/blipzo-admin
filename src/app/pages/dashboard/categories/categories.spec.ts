import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CategoriesService } from '../../../core/categories/categories.service';

import { Categories } from './categories';

describe('Categories', () => {
  let component: Categories;
  let fixture: ComponentFixture<Categories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Categories],
      providers: [
        {
          provide: CategoriesService,
          useValue: {
            getCategories: () =>
              of({
                defaults: {
                  income: {
                    id: 'cat-income-default',
                    name: 'General Income',
                    type: 'income',
                    isDefault: true,
                    isActive: true,
                    status: 'DEFAULT',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                  expense: {
                    id: 'cat-expense-default',
                    name: 'Miscellaneous Expense',
                    type: 'expense',
                    isDefault: true,
                    isActive: true,
                    status: 'DEFAULT',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                },
                settings: { defaultCategoryLimit: 10 },
                categories: [],
                total: 0,
              }),
            createCategory: () =>
              of({
                id: 'cat-new',
                name: 'New Category',
                type: 'expense',
                isDefault: false,
                isActive: true,
                status: 'STANDARD',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }),
            updateCategory: () =>
              of({
                id: 'cat-update',
                name: 'Updated Category',
                type: 'expense',
                isDefault: false,
                isActive: true,
                status: 'STANDARD',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }),
            setDefaultCategory: () =>
              of({
                id: 'cat-default',
                name: 'Default Category',
                type: 'income',
                isDefault: true,
                isActive: true,
                status: 'DEFAULT',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }),
            deleteCategory: () => of({ id: 'cat-del', deleted: true }),
            updateGlobalCategoryLimit: () => of({ defaultCategoryLimit: 10 }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Categories);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
