import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http'

import { ReportService } from './report.service';

describe('ReportService', () => {
  let service: ReportService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    httpSpy = jasmine.createSpyObj('HttpClient', ['post']);
    service = new ReportService(httpSpy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send post request on report', (done) => {
    httpSpy.post.and.returnValue(of("test"));
    service.reportPost("0", 0, "report test").then(res => {
      expect(res).toEqual(true);
      done();
    })
  });
});
