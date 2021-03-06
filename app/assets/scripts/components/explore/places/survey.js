import React, { Component } from 'react';
import styled from 'styled-components';
import { PropTypes as T } from 'prop-types';
import { connect } from 'react-redux';
import { environment } from '../../../config';
import ReactTooltip from 'react-tooltip';
import { withFormik } from 'formik';

import { fetchPlace } from '../../../redux/actions/places';
import {
  fetchSurveyMeta,
  postSurvey,
  fetchSurveyAnswers
} from '../../../redux/actions/surveys';
import { wrapApiResult, getFromState, isLoggedIn } from '../../../redux/utils';

import toasts from '../../common/toasts';

import { StyledLink } from '../../common/link';

import { PlaceTitle } from '../../../styles/place';
import Button from '../../../styles/button/button';
import InnerPanel from '../../../styles/inner-panel';
import Form from '../../../styles/form/form';
import FormTextarea from '../../../styles/form/textarea';

import FormLegend from '../../../styles/form/legend';
import FormLabel from '../../../styles/form/label';
import {
  FormGroup,
  FormGroupHeader,
  FormGroupFooter,
  FormGroupBody
} from '../../../styles/form/group';
import {
  FormCheckableGroup,
  FormCheckable
} from '../../../styles/form/checkable';
import {
  showGlobalLoading,
  hideGlobalLoading
} from '../../common/global-loading';
import { Panel } from '../../../styles/panel';

const PanelForm = styled(Form)`
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  height: 100%;
  &:last-child {
    margin-top: auto;
  }
`;

const InnerSurveyForm = (props) => {
  const {
    values,
    setFieldValue,
    handleSubmit,
    handleChange,
    place,
    survey,
    campaign
  } = props;

  function renderQuestion(q) {
    const value = values[q.id];
    return (
      <FormGroup key={q.id}>
        <FormGroupHeader>
          <FormLabel>{q.label}</FormLabel>
        </FormGroupHeader>
        <FormGroupBody>
          {q.type === 'boolean' && (
            <FormCheckableGroup>
              <FormCheckable
                textPlacement='right'
                checked={value === true}
                type='radio'
                name='boolean-radio'
                id='radio-yes'
                onChange={() => setFieldValue(q.id, true)}
              >
                Yes
              </FormCheckable>
              <FormCheckable
                textPlacement='right'
                checked={value === false}
                type='radio'
                name='boolean-radio'
                id='radio-no'
                onChange={() => setFieldValue(q.id, false)}
              >
                No
              </FormCheckable>
            </FormCheckableGroup>
          )}
          {q.type === 'text' && (
            <FormTextarea
              size='large'
              id={q.id}
              placeholder='Description'
              onChange={handleChange}
              value={value}
            />
          )}
        </FormGroupBody>
      </FormGroup>
    );
  }

  return (
    <PanelForm onSubmit={handleSubmit}>
      <FormLegend>Name</FormLegend>
      {place.properties.name && (
        <PlaceTitle>{place.properties.name}</PlaceTitle>
      )}
      {survey.questions.map((q) => renderQuestion(q))}
      <FormGroupFooter>
        <Button
          variation='primary-raised-dark'
          size='large'
          type='submit'
          data-tip='Submit survey'
        >
          Submit
        </Button>
        <Button
          as={StyledLink}
          to={`/explore/${campaign.slug}/${place.id}`}
          variation='danger-raised-light'
          size='large'
          data-tip='Cancel survey'
        >
          Cancel
        </Button>
        <ReactTooltip effect='solid' className='type-primary' />
      </FormGroupFooter>
    </PanelForm>
  );
};

if (environment !== 'production') {
  InnerSurveyForm.propTypes = {
    campaign: T.object,
    place: T.object,
    survey: T.object,
    values: T.object.isRequired,
    setFieldValue: T.func.isRequired,
    handleSubmit: T.func.isRequired,
    handleChange: T.func.isRequired
  };
}

const SurveyForm = withFormik({
  mapPropsToValues: (props) => {
    return props.survey.questions.reduce((values, q) => {
      let value;
      switch (q.type) {
        case 'boolean':
          value = undefined;
          break;
        default:
          value = '';
      }
      values[q.id] = value;
      return values;
    }, {});
  },

  handleSubmit: (values, { props }) => {
    props.handleSubmit(values);
  }
})(InnerSurveyForm);

class SubmitSurvey extends Component {
  constructor(props) {
    super(props);

    this.postSurvey = this.postSurvey.bind(this);
  }

  async componentDidMount() {
    await this.fetchData();
  }

  async fetchData() {
    const { type, id, campaignSlug } = this.props.match.params;
    const placeId = `${type}/${id}`;

    // Disallow unlogged users
    if (!this.props.isLoggedIn) {
      toasts.info(`You must be logged in to submit surveys.`);
      this.props.history.push(`/explore/${campaignSlug}/${placeId}`);
      return;
    }

    // Load place
    await this.props.fetchPlace(placeId);

    // Load survey meta
    await this.props.fetchSurveyMeta();

    // Load survey answers, if any
    const { surveyMeta, place, user, campaign } = this.props;
    if (
      surveyMeta.isReady() &&
      !surveyMeta.hasError() &&
      place.isReady() &&
      !place.hasError()
    ) {
      await this.props.fetchSurveyAnswers({
        userId: user.getData().id,
        osmObjectId: place.getData().id,
        surveyId: surveyMeta.getData().id,
        campaignId: campaign.id
      });
    }
  }

  async postSurvey(data) {
    const {
      match: {
        params: { campaignSlug }
      }
    } = this.props;

    showGlobalLoading();
    try {
      await this.props.postSurvey(data);
      toasts.info('Survey sent successfully');
      this.props.history.push(`/explore/${campaignSlug}/${data.osmObject.id}`);
    } catch (error) {
      toasts.error('There was an error sending the survey.');
    }
    hideGlobalLoading();
  }

  render() {
    const {
      place,
      surveyMeta,
      surveyAnswers,
      campaign
    } = this.props;

    // Delay rendering until all needed data is loaded
    if (!place.isReady() || !surveyAnswers.isReady() || !surveyMeta.isReady()) {
      return <div />;
    }

    if (place.hasError() || surveyAnswers.hasError() || surveyMeta.hasError()) {
      return <div>As error occurred when fetching place data</div>;
    }

    // Get survey data
    if (!surveyMeta.getData()) return <div>No survey is available.</div>;

    const data = {
      survey: surveyMeta.getData(),
      place: place.getData()
    };

    return (
      <Panel>
        <InnerPanel>
          <SurveyForm
            survey={data.survey}
            place={data.place}
            campaign={campaign}
            handleSubmit={(values) =>
              this.postSurvey({
                surveyId: data.survey.id,
                osmObject: data.place,
                campaignId: campaign.id,
                createdAt: new Date().toISOString(),
                answers: data.survey.questions.map((q) => {
                  return {
                    questionId: q.id,
                    questionVersion: q.version,
                    answer: {
                      value: values[q.id]
                    }
                  };
                })
              })}
          />
        </InnerPanel>
      </Panel>
    );
  }
}

if (environment !== 'production') {
  SubmitSurvey.propTypes = {
    fetchPlace: T.func,
    postSurvey: T.func,
    fetchSurveyMeta: T.func,
    fetchSurveyAnswers: T.func,
    history: T.object,
    isLoggedIn: T.bool,
    match: T.object,
    place: T.object,
    campaign: T.object,
    user: T.object,
    surveyMeta: T.object,
    surveyAnswers: T.object
  };
}

function mapStateToProps(state, props) {
  const { type, id, campaignSlug } = props.match.params;
  const placeId = `${type}/${id}`;

  // Load campaign right away as it should be already loaded by
  // Explorer view
  const campaigns = wrapApiResult(getFromState(state, `campaigns`));
  const campaign = campaigns.getData()[campaignSlug];

  return {
    user: wrapApiResult(state.authenticatedUser),
    place: wrapApiResult(getFromState(state, `places.individual.${placeId}`)),
    campaign,
    surveyMeta: wrapApiResult(getFromState(state, `activeSurvey.meta`)),
    surveyAnswers: wrapApiResult(getFromState(state, `activeSurvey.answers`)),
    isLoggedIn: isLoggedIn(state)
  };
}

function dispatcher(dispatch) {
  return {
    fetchPlace: (...args) => dispatch(fetchPlace(...args)),
    fetchSurveyMeta: (...args) => dispatch(fetchSurveyMeta(...args)),
    fetchSurveyAnswers: (...args) => dispatch(fetchSurveyAnswers(...args)),
    postSurvey: (...args) => dispatch(postSurvey(...args))
  };
}

export default connect(mapStateToProps, dispatcher)(SubmitSurvey);
