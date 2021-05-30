import { render } from '@testing-library/react';

import Filezone from './filezone';

describe('Filezone', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Filezone />);
    expect(baseElement).toBeTruthy();
  });
});
