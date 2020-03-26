import React from 'react';
import styled from 'styled-components';

import App from '../common/app';
import { Inpage, InpageBody } from '../common/inpage';
import { InnerPanel, Panel } from '../../styles/panel';
import Button from '../../styles/button/button';
import { themeVal } from '../../styles/utils/general';
import DataTable from '../../styles/table';

const PanelStats = styled.div`
  display: flex;
  flex-flow: row wrap;
  margin: 2rem 0;
`;

const PanelStat = styled.h2`
  display: flex;
  flex-flow: column wrap;
  &:not(:last-child) {
    border-right: 1px solid ${themeVal('color.shadow')};
    margin-right: ${themeVal('layout.space')};
    padding-right: ${themeVal('layout.space')};
  }
  span {
    color: ${themeVal('color.baseLight')};
    font-size: 0.875rem;
    text-transform: uppercase;
    word-break: break-all;
  }
`;

export default class Trends extends React.Component {
  render () {
    return (
      <App pageTitle='Trends'>
        <Inpage>
          <InpageBody>
            <Panel>
              <InnerPanel>
                <h2>Washington DC</h2>
                <p>1776 restaurants surveyed</p>
                <p>75% of 2,377 restaurants on OpenStreetMap</p>
                <h3>81%</h3>
                <p>
                1438 Surveyed Washington DC Restaurants offer plastic-free
                options
                </p>
                <PanelStats>
                  <PanelStat>
                  1776
                    <span>
                    Restaurants
                      <br />
                    Surveyed
                    </span>
                  </PanelStat>
                  <PanelStat>
                  142
                    <span>Surveyors</span>
                  </PanelStat>
                  <PanelStat>
                  2123
                    <span>
                    Restaurants to
                      <br />
                    Survey
                    </span>
                  </PanelStat>
                  <PanelStat>
                  16
                    <span>
                    Restaurants
                      <br />
                    Near You
                    </span>
                  </PanelStat>
                </PanelStats>
                <Button useIcon='map' variation='base-raised-dark'>
                Show me the map
                </Button>
              </InnerPanel>
              <InnerPanel>
                <h2>Surveyors</h2>
                <PanelStat>
                  12
                  <span>surveys</span>
                </PanelStat>
                <PanelStat>
                  2020
                  <span>surveyors</span>
                </PanelStat>
                <PanelStat>
                  122
                  <span>locations</span>
                </PanelStat>
               
              </InnerPanel>
              <InnerPanel>
                <h2>Top Surveyors</h2>
                <DataTable>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Surveyor</th>
                      <th>Surveys</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>Bob Smith</td>
                      <td>24</td>
                      <td><Button size='small' variation='base-plain' useIcon='trash-bin' hideText title='Remove user'>Remove</Button></td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>Jane Good</td>
                      <td>19</td>
                      <td><Button size='small' variation='base-plain' useIcon='trash-bin' hideText title='Remove user'>Remove</Button></td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td>Matt Park</td>
                      <td>12</td>
                      <td><Button size='small' variation='base-plain' useIcon='trash-bin' hideText title='Remove user'>Remove</Button></td>
                    </tr>
                  </tbody>
                </DataTable>
              </InnerPanel>
            </Panel>
          </InpageBody>
        </Inpage>
      </App>
    );
  }
}
