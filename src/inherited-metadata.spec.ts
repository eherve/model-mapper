/** @format */

import { expect } from 'chai';
import { ModelMapper } from './model-mapper';
import { Model } from './model.decorator';
import { IPropertyMapOptions, propertyMap } from './property-map.decorator';

class HistoryOccurrence {
  @propertyMap({ type: Date })
  public date: Date;

  @propertyMap()
  public seq: number;
}

@Model({ discriminatorKey: 'kind' })
class InheritedBaseModel {
  @propertyMap()
  public kind: string;

  @propertyMap()
  public inheritedValue: string;

  @propertyMap({ type: [HistoryOccurrence], default: [] })
  public occurrences: HistoryOccurrence[];
}

class ChildWithoutOwnProperty extends InheritedBaseModel {
  public declare kind: 'without-own';
}

class ChildWithOwnProperty extends InheritedBaseModel {
  public declare kind: 'with-own';

  @propertyMap()
  public ownValue: string;
}

class ChildWithOverride extends InheritedBaseModel {
  public declare kind: 'with-override';

  @propertyMap({ source: 'childValue' })
  public override inheritedValue: string;
}

const inheritedDiscriminators = {
  'without-own': ChildWithoutOwnProperty,
  'with-own': ChildWithOwnProperty,
  'with-override': ChildWithOverride,
};

class InheritedContainer {
  @propertyMap({
    type: [InheritedBaseModel],
    discriminators: inheritedDiscriminators,
  })
  public items: InheritedBaseModel[];
}

const occurrenceDate = '2026-07-12T09:02:30.911Z';

const withoutOwnSource = {
  kind: 'without-own',
  inheritedValue: 'inherited',
  occurrences: [{ date: occurrenceDate, seq: 141 }],
};

const withOwnSource = {
  kind: 'with-own',
  inheritedValue: 'inherited',
  ownValue: 'own',
  occurrences: [{ date: occurrenceDate, seq: 142 }],
};

describe('Inherited property mapping metadata', () => {
  it('maps inherited properties on a subclass without own decorators', () => {
    const result = new ModelMapper(ChildWithoutOwnProperty).map(withoutOwnSource);

    expect(result).to.be.instanceOf(ChildWithoutOwnProperty);
    expect(result.kind).to.equal('without-own');
    expect(result.inheritedValue).to.equal('inherited');
    expect(result.occurrences).to.have.length(1);
    expect(result.occurrences[0]).to.be.instanceOf(HistoryOccurrence);
    expect(result.occurrences[0].date).to.be.instanceOf(Date);
  });

  it('maps inherited and own properties on a decorated subclass', () => {
    const result = new ModelMapper(ChildWithOwnProperty).map(withOwnSource);

    expect(result).to.be.instanceOf(ChildWithOwnProperty);
    expect(result.inheritedValue).to.equal('inherited');
    expect(result.ownValue).to.equal('own');
    expect(result.occurrences[0].date).to.be.instanceOf(Date);
  });

  it('lets a child override a mapping without changing the parent mapping', () => {
    const childResult = new ModelMapper(ChildWithOverride).map({
      kind: 'with-override',
      inheritedValue: 'parent-source',
      childValue: 'child-source',
      occurrences: [],
    });
    const parentResult = new ModelMapper(InheritedBaseModel).map({
      kind: 'base',
      inheritedValue: 'parent-source',
      childValue: 'child-source',
      occurrences: [],
    });
    const childMapping = childResult.getPropertyMapping() as { [key: string]: IPropertyMapOptions };
    const parentMapping = parentResult.getPropertyMapping() as { [key: string]: IPropertyMapOptions };

    expect(childResult.inheritedValue).to.equal('child-source');
    expect(parentResult.inheritedValue).to.equal('parent-source');
    expect(childMapping.inheritedValue.source).to.equal('childValue');
    expect(parentMapping.inheritedValue.source).to.equal('inheritedValue');
  });

  it('maps arrays through discriminators when one child has no own decorators', () => {
    const result = new ModelMapper(InheritedContainer).map({
      items: [withoutOwnSource, withOwnSource],
    });

    expect(result.items[0]).to.be.instanceOf(ChildWithoutOwnProperty);
    expect(result.items[0].inheritedValue).to.equal('inherited');
    expect(result.items[0].occurrences[0].date).to.be.instanceOf(Date);
    expect(result.items[1]).to.be.instanceOf(ChildWithOwnProperty);
    expect((result.items[1] as ChildWithOwnProperty).ownValue).to.equal('own');
  });

  it('maps a root discriminator to a subclass without own decorators', () => {
    const result = new ModelMapper(InheritedBaseModel, inheritedDiscriminators).map(withoutOwnSource);

    expect(result).to.be.instanceOf(ChildWithoutOwnProperty);
    expect(result.inheritedValue).to.equal('inherited');
    expect(result.occurrences[0].date).to.be.instanceOf(Date);
  });

  it('serializes inherited nested mappings selected through discriminators', () => {
    const mapper = new ModelMapper(InheritedContainer);
    const mapped = mapper.map({ items: [withoutOwnSource, withOwnSource] });
    const serialized = mapper.serialize(mapped);

    expect(serialized.items[0]).to.deep.equal(withoutOwnSource);
    expect(serialized.items[1]).to.deep.equal(withOwnSource);
  });

  it('does not mutate stored parent metadata while building a child mapping tree', () => {
    const parentPrototype = InheritedBaseModel.prototype;
    const before = Reflect.getOwnMetadata('propertyMap', parentPrototype) as {
      [key: string]: IPropertyMapOptions;
    };

    new ModelMapper(ChildWithOwnProperty).getPropertyMappingTree();

    const after = Reflect.getOwnMetadata('propertyMap', parentPrototype) as {
      [key: string]: IPropertyMapOptions;
    };
    expect((before.occurrences as any).propertyMapping).to.be.undefined;
    expect((after.occurrences as any).propertyMapping).to.be.undefined;
  });
});
