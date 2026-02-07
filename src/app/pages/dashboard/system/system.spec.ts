import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SystemService } from '../../../core/system/system.service';

import { System } from './system';

describe('System', () => {
  let component: System;
  let fixture: ComponentFixture<System>;

  beforeEach(async () => {
    const systemServiceStub: Partial<SystemService> = {
      getSnapshot: () =>
        of({
          providerHealth: {
            status: 'ok',
            sendRatePerDay: 300,
            sentToday: 0,
            failedToday: 0,
            usagePct: 0,
            successRate: 100,
          },
          dbHealth: {
            connected: true,
            totalSizeGb: 0,
            dataSizeMb: 0,
            indexSizeMb: 0,
            capacityGb: 5,
            usedPct: 0,
            remainingGb: 5,
          },
          backup: {
            lastBackupAt: null,
            lastBackupStatus: 'never',
            target: 'remote_cloud_storage_node_01',
            runningJob: null,
            lastJobId: null,
          },
          deleteRequests: {
            total: 0,
            pending: 0,
          },
        }),
      getDeleteRequests: () =>
        of({
          requests: [],
          summary: { pending: 0, approved: 0, denied: 0, total: 0 },
        }),
      getProviderUsage: () =>
        of({
          selectedDate: '2026-02-07',
          summary: { sent: 0, limit: 300, usagePct: 0, successRate: 100, failed: 0 },
          history: [],
          hourlyDistribution: [],
          failedEvents: [],
        }),
      startBackup: () =>
        of({
          id: 'job-1',
          status: 'running',
          progress: 0,
          stage: 'Preparing backup snapshot',
          target: 'remote_cloud_storage_node_01',
          startedAt: null,
          completedAt: null,
          fileName: null,
          fileSizeBytes: null,
          errorCode: null,
          errorMessage: null,
        }),
      getBackup: () =>
        of({
          id: 'job-1',
          status: 'success',
          progress: 100,
          stage: 'Backup completed',
          target: 'remote_cloud_storage_node_01',
          startedAt: null,
          completedAt: null,
          fileName: 'backup.zip',
          fileSizeBytes: 1024,
          errorCode: null,
          errorMessage: null,
        }),
      cancelBackup: () =>
        of({
          id: 'job-1',
          status: 'canceled',
          progress: 50,
          stage: 'Backup canceled',
          target: 'remote_cloud_storage_node_01',
          startedAt: null,
          completedAt: null,
          fileName: null,
          fileSizeBytes: null,
          errorCode: null,
          errorMessage: null,
        }),
      decideDeleteRequest: () => of({ id: 'req-1', status: 'approved' }),
    };

    await TestBed.configureTestingModule({
      imports: [System],
      providers: [{ provide: SystemService, useValue: systemServiceStub }],
    })
    .compileComponents();

    fixture = TestBed.createComponent(System);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
