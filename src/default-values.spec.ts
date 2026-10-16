/** @format */

import { expect } from 'chai';
import { ModelMapper } from './model-mapper';
import { propertyMap } from './property-map.decorator';

class ModelWithDefaults {
  @propertyMap({ default: [] })
  public items: string[];

  @propertyMap({ default: { enabled: false } })
  public settings: { enabled: boolean };

  @propertyMap({ default: () => [] })
  public generated: string[];
}

describe('Mapping default values', () => {
  it('gives each mapped object independent mutable defaults', () => {
    const mapper = new ModelMapper(ModelWithDefaults);
    const first = mapper.map({});
    const second = mapper.map({});

    first.items.push('first');
    first.settings.enabled = true;
    first.generated.push('generated');

    expect(second.items).to.deep.equal([]);
    expect(second.settings).to.deep.equal({ enabled: false });
    expect(second.generated).to.deep.equal([]);
  });

  it('does not replace values provided by the source', () => {
    const mapper = new ModelMapper(ModelWithDefaults);
    const sourceItems = ['provided'];
    const mapped = mapper.map({ items: sourceItems, settings: null });

    expect(mapped.items).to.equal(sourceItems);
    expect(mapped.settings).to.equal(null);
  });
});
