import { TestBed } from '@angular/core/testing';

import { UtilsService } from './utils.service';

describe('UtilsService', () => {
  let service: UtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe("objectToFormData takes an object", () => {
    it('returns a formdata object', () => {
      expect(service.objectToFormData({})).toEqual(new FormData())
    });
    it('that has the keys and values of the input', () => {
      const input = {
        "key1": "val1",
        "key2": "val2"
      }
      const output = service.objectToFormData(input);
      expect(output.get("key1")).toEqual("val1");
      expect(output.get("key2")).toEqual("val2");
    });
  });
});
