/** @format */

import { expect } from 'chai';
import { clone, cloneDeep, each, merge } from 'lodash';
import { Duration, Moment } from 'moment';
import { ModelMapper } from './model-mapper';
import { propertyMap } from './property-map.decorator';
import chai = require('chai');
import moment = require('moment');
import { Discriminator } from './discriminator.decorator';

class DiscrimenatedClass {
  @propertyMap()
  public family: 'DiscrimenatedA' | 'DiscrimenatedB';
}
@Discriminator({ key: 'family', value: 'DiscrimenatedA' })
class DiscrimenatedAClass extends DiscrimenatedClass {
  override family: 'DiscrimenatedA' = 'DiscrimenatedA';

  @propertyMap()
  public DiscrimenatedA: string;
}
@Discriminator({ key: 'family', value: 'DiscrimenatedB' })
class DiscrimenatedBClass extends DiscrimenatedClass {
  override family: 'DiscrimenatedB' = 'DiscrimenatedB';

  @propertyMap()
  public DiscrimenatedB: string;
}

class Test {
  @propertyMap({ source: '_id' })
  public id: string;

  @propertyMap()
  public name: string;

  @propertyMap()
  public noData: string;

  @propertyMap({ source: 'info.description' })
  public description: string;

  @propertyMap({ type: Date })
  public dateType: Date;

  @propertyMap({ type: 'Moment' })
  public dateString: Moment;

  @propertyMap({ type: 'Moment' })
  public dateMoment: Moment;

  @propertyMap({ type: 'Moment' })
  public date: Moment;

  @propertyMap({ type: 'Moment.Duration' })
  public duration: Duration;

  @propertyMap({ type: Test })
  public subTest: Test;

  @propertyMap({ type: [Test] })
  public subTests: Test[];

  @propertyMap({ source: 'embedeInList.items.model', type: [Test] })
  public embedeInList: Test[];

  @propertyMap({ source: 'embedeInList.items.model.embedeInEmbedList.items.model', type: [Test] })
  public embedeInEmbededList: Test[];

  @propertyMap({
    map: (source: any, value: any, target: any, property: string) => {
      return 'overrided mapData';
    },
  })
  public mapData: string;

  @propertyMap({ type: DiscrimenatedClass })
  discrimenatedClass: DiscrimenatedClass;
}

// @Discriminator({ key: 'family', value: 'TestA' })
// class TestA extends Test {
//   @propertyMap()
//   public extendedA: string;
// }

const discrimenatedAClassData = {
  family: 'DiscrimenatedA',
  DiscrimenatedA: 'DiscrimenatedA',
};

const discrimenatedBClassData = {
  family: 'DiscrimenatedB',
  DiscrimenatedB: 'DiscrimenatedB',
};

const data: any = {
  _id: 0,
  family: 'Test',
  name: 'Test',
  dateType: new Date(),
  dateString: moment().format('YYYY-MM-DD'),
  dateMoment: moment(),
  date: new Date(),
  duration: 'P1Y2M3DT4H5M6S',
  unmapped: 'unmapped',
  info: {
    description: 'Description',
  },
  mapData: 'mapData',
  discrimenatedClass: cloneDeep(discrimenatedAClassData),
};
const subTest = cloneDeep(data);
const subTests = new Array(2).fill(cloneDeep(data));
const embedeInList = {
  items: new Array(1).fill({
    model: merge(cloneDeep(data), {
      discrimenatedClass: cloneDeep(discrimenatedBClassData),
      embedeInEmbedList: {
        items: new Array(2).fill({
          model: cloneDeep(data),
        }),
      },
    }),
  }),
};
data.subTest = subTest;
data.subTests = subTests;
data.embedeInList = embedeInList;

const mapped = new ModelMapper(Test).map(data);

function validateTest(testData: any, info?: string) {
  const run = () => {
    it(`should have "id" string property`, () => {
      expect(testData.id).to.be.equals(data._id);
    });
    it(`should have "test" string property`, () => {
      expect(testData.name).to.be.equals(data.name);
    });
    it(`should have "description" string property`, () => {
      expect(testData.description).to.be.equals(data.info.description);
    });
    it(`should have "noData" string property not mapped`, () => {
      expect(testData.noData).to.be.undefined;
    });
    it(`should not have "unmapped" property`, () => {
      expect(testData.unmapped).to.be.undefined;
    });
    it(`should have "dateType" Date property`, () => {
      expect(testData.dateType).to.not.be.undefined;
      expect(testData.dateType).to.not.be.null;
      expect(testData.dateType.valueOf()).to.be.equals(data.dateType.valueOf());
    });
    it(`should have "dateString" Moment property`, () => {
      expect(testData.dateString).to.not.be.undefined;
      expect(testData.dateString).to.not.be.null;
      expect(testData.dateString.isSame(data.dateString)).to.be.true;
    });
    it(`should have "dateMoment" Moment property`, () => {
      expect(testData.dateMoment).to.not.be.undefined;
      expect(testData.dateMoment).to.not.be.null;
      expect(testData.dateMoment.isSame(data.dateMoment)).to.be.true;
    });
    it(`should have "date" Moment property`, () => {
      expect(testData.date).to.not.be.undefined;
      expect(testData.date).to.not.be.null;
      expect(testData.date.isSame(data.date)).to.be.true;
    });
    it(`should have "duration" Moment Duration property`, () => {
      expect(testData.date).to.not.be.undefined;
      expect(testData.date).to.not.be.null;
      expect(testData.duration.milliseconds() === moment.duration(data.duration).milliseconds()).to.be.true;
    });
    it(`should have "mapData" overrided`, () => {
      expect(testData.mapData).to.be.equals('overrided mapData');
    });
    it(`should have "discrimenatedClass.family" string property`, () => {
      expect(testData.discrimenatedClass.family).to.exist;
    });
    switch (testData.discrimenatedClass.family) {
      case 'DiscrimenatedA':
        it(`should have "discrimenatedClass.DiscrimenatedA" string property`, () => {
          expect(testData.discrimenatedClass.DiscrimenatedA).to.be.equals('DiscrimenatedA');
        });
        it(`should not have "discrimenatedClass.DiscrimenatedB" string property`, () => {
          expect(testData.discrimenatedClass.DiscrimenatedB).not.exist;
        });
        break;
      case 'DiscrimenatedB':
        it(`should have "discrimenatedClass.DiscrimenatedB" string property`, () => {
          expect(testData.discrimenatedClass.DiscrimenatedB).to.be.equals('DiscrimenatedB');
        });
        it(`should not have "discrimenatedClass.DiscrimenatedA" string property`, () => {
          expect(testData.discrimenatedClass.DiscrimenatedA).not.exist;
        });
        break;
    }
  };
  if (info) describe(info, () => run());
  else run();
}

describe('ModelMapper Module', () => {
  describe('validate properties', () => {
    validateTest(mapped);
  });
  describe('validate SubModel properties', () => {
    expect(mapped.subTest).to.not.be.undefined;
    expect(mapped.subTest).to.not.be.null;
    validateTest(mapped.subTest);
  });
  describe('validate SubModel array properties', () => {
    expect(mapped.subTests).to.not.be.undefined;
    expect(mapped.subTests).to.not.be.null;
    expect(mapped.subTests.length).to.be.gt(0);
    each(mapped.subTests, (d, i) => validateTest(d, `SubModel [${i}]`));
  });
  describe('validate SubModel in array properties', () => {
    expect(mapped.embedeInList).to.not.be.undefined;
    expect(mapped.embedeInList).to.not.be.null;
    expect(mapped.embedeInList.length).to.be.gt(0);
    each(mapped.embedeInList, (d, i) => validateTest(d, `In Array SubModel [${i}]`));
  });
  describe('validate SubModel in array of SubModel properties', () => {
    expect(mapped.embedeInEmbededList).to.not.be.undefined;
    expect(mapped.embedeInEmbededList).to.not.be.null;
    expect(mapped.embedeInEmbededList.length).to.be.gt(0);
    each(mapped.embedeInEmbededList, (d, i) => validateTest(d, `In Array SubModel Array [${i}]`));
  });
});
