import styled from 'styled-components';
import media from './utils/media-queries';
import { themeVal } from './utils/general';
import { cardSkin, hideScrollbars } from './skins';

export const Panel = styled.section`
  position: relative; /* Likely change to fixed within grid */
  background: ${themeVal('color.background')};
  z-index: 20;
  ${hideScrollbars()};
  ${media.mediumUp`
    padding: 1rem;
    margin-bottom: 0;
    display: flex;
    flex-flow: column nowrap;
    max-height: calc(100vh - 4rem);
    overflow-y: scroll;
    border-right: 1px solid ${themeVal('color.smoke')};
  `}
  ${media.largeUp`
    padding: 2rem;
  `}
`;

export const MobileCard = styled.article`
  ${cardSkin()};
  border-radius: 0.5rem;
  padding: ${themeVal('layout.space')};
  position: relative;
  margin: 1rem auto -1rem;
  ${media.mediumUp`
    margin: 0 auto;
    border-radius: initial;
    padding: 2rem;
  `}
`;

export const InnerPanel = styled.article`
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  align-items: stretch;
  justify-content: space-between;
  margin: 0;
  border-radius: ${themeVal('shape.rounded')};
  background: ${themeVal('color.surface')};
  box-shadow: 0 0 6px 1px ${themeVal('color.shadow')};
  padding: 1rem;
  max-height: calc(100vh - 10.5rem);
  ${media.mediumUp`
    padding: 1.5rem;
    flex: 1;
    justify-content: flex-start;
    margin: 2rem 0 0;
  `}

  a {
    text-decoration: none;
  }
`;

export const PanelFooter = styled.footer`
  margin-top: auto;
  align-self: flex-end;
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;

  & > *:not(:first-child) {
    margin-top: 1rem
  }
`;

export const PanelStats = styled.div`
  display: flex;
  flex-flow: row nowrap;
  margin: 2rem auto;
`;

export const PanelStat = styled.h2`
  display: flex;
  flex-flow: column wrap;
  &:not(:last-child) {
    border-right: 1px solid ${themeVal('color.shadow')};
    margin-right: ${themeVal('layout.space')};
    padding-right: ${themeVal('layout.space')};
  }
  span {
    color: ${themeVal('color.baseLight')};
    font-size: 0.75rem;
    text-transform: uppercase;
  }
`;
