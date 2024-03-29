import React from "react";
import { postReq } from "../utils/customAxiosLib";
import "../css/App.css";
import "react-datepicker/dist/react-datepicker.css";
import { useForm, Controller } from "react-hook-form";
import { withRouter, useParams } from "react-router-dom";
import ReactDatePicker from "react-datepicker";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import TextField from "@material-ui/core/TextField";

const TypeSelection_Enum = {
  SINGLE_CHOICE: "Single Choice",
  MULTI_SELECT: "Multiple selection",
  TRUE_FALSE: "True or False",
};

function ElectionForm(props) {
  let { orgId } = useParams();

  // functions to build form returned by useForm() hook
  const { register, handleSubmit, reset, errors, watch, control } = useForm({});

  // watch to enable re-render when question number is changed
  const watchNumberOfQuestions = watch("numberOfQuestions");

  // watch to enable re-render when fields number is changed
  const watchNumberOfFields = watch("numberOfFields");

  // watch to enable re-render of selections
  const watchTypeOfQuestions = watch("typeOfQuestions");

  // return array of question indexes for rendering dynamic forms in the template
  function questionNumbers() {
    let tmp = 0;
    if (watchNumberOfQuestions < 0) tmp = 0;
    else tmp = watchNumberOfQuestions;
    return [...Array(parseInt(tmp || 0)).keys()];
  }

  function numberOfFields() {
    let tmp = 0;
    if (watchNumberOfFields < 0) tmp = 0;
    else tmp = watchNumberOfFields;

    if (watchTypeOfQuestions !== TypeSelection_Enum.TRUE_FALSE) {
      return [...Array(parseInt(tmp || 0)).keys()];
    } else {
      setFieldValuesBool();
      return [...(Array("True", "False") || 0).keys()];
    }
  }

  function setFieldValuesBool() {
    const field_divs = document.getElementsByClassName("field-value");
    for (let i = 0; i < field_divs.length; i++) {
      const input_elements = field_divs[i].getElementsByTagName("input");
      i % 2 === 0 ? (input_elements[0].value = "true") : (input_elements[0].value = "false");
    }
  }

  function updateOptionsJSON(json_obj) {
    let count = 0;
    json_obj.election_id = 0;
    if (json_obj.questions !== undefined) {
      json_obj.questions.map(q => {
        q.election_id = 0;
        q.ordered_choices = true;
        q.max_selection_count = parseInt(json_obj["max_selection_count"]) || 1;
        q.min_selection_count = parseInt(json_obj["min_selection_count"]) || 1;

        q.options.map(op => {
          op.option_id = count;
          count += 1;
        });
      });
    }
    delete json_obj["numberOfQuestions"];
    delete json_obj["numberOfFields"];
    delete json_obj["typeOfQuestions"];
    delete json_obj["max_selection_count"]
    delete json_obj["min_selection_count"]
    json_obj["start_time"] = json_obj["start_time"].toISOString().slice(0, -5) + "+00:00";
    json_obj["end_time"]   = json_obj["end_time"].toISOString().slice(0, -5) + "+00:00";
    json_obj["org_id"] = parseInt(orgId);
    return json_obj;
  }
  function onSubmit(data) {
    // display form data on success
    data = updateOptionsJSON(data);
    // console.log(JSON.stringify(data, null, 4));

    postReq("/org/elections", data)
      .then(response => {
        if (200 <= response.status && response.status < 300) {
          console.log("Election created");
          setTimeout(() => {
            redirectToOrganizationDetails();
          }, 500);
        }
      })
      .catch(error => {
        console.log("create election error");
        console.log(error);
      });
  }

  const redirectToOrganizationDetails = () => {
    console.log("[ + ] Redirecting to view details of org: " + orgId);
    props.history.push(`/orgList/`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} onReset={reset}>
      <div className="card m-3">
        <h5 className="card-header">
          Create election for organisation ID: {orgId}
        </h5>

        <Controller
          name="election_description"
          as={
            <TextField
              id="election_description"
              label="Event Description"
              required
            />
          }
          control={control}
          defaultValue=""
          rules={{
            required: true,
          }}
        />

        <FormControlLabel
          label="Verification Required?"
          name="verified"
          inputRef={register}
          control={
            <Checkbox
              style={{
                color: "#c5ae2d",
                marginLeft: "1em",
              }}
            />
          }
        />

        <FormControlLabel
          label="Results publicily available?"
          name="public_results"
          inputRef={register}
          control={
            <Checkbox
              style={{
                color: "#c5ae2d",
                marginLeft: "1em",
              }}
            />
          }
        />

        <FormControlLabel
          label="Anonymous election?"
          name="anonymous"
          inputRef={register}
          control={
            <Checkbox
              style={{
                color: "#c5ae2d",
                marginLeft: "1em",
              }}
            />
          }
        />
          <div className="card-body border-bottom">
            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <Controller
                  name={"start_time"}
                  control={control}
                  render={({ onChange, value }) => (
                    <ReactDatePicker
                      selected={value}
                      onChange={onChange}
                      timeInputLabel="Time:"
                      dateFormat="MM/dd/yyyy h:mm aa"
                      showTimeSelect
                      required
                    />
                  )}
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <Controller
                  name={"end_time"}
                  control={control}
                  render={({ onChange, value }) => (
                    <ReactDatePicker
                      selected={value}
                      onChange={onChange}
                      timeInputLabel="Time:"
                      dateFormat="MM/dd/yyyy h:mm aa"
                      showTimeSelect
                      required
                    />
                  )}
                />
              </div>
            </div>
          </div>
        <div className="card-body border-bottom">
          <div className="form-row">
            <div className="form-group">
              <label>Number of Questions</label>
              <input
                defaultValue="1"
                name="numberOfQuestions"
                ref={register}
                className={`form-control`}
                required
                type="number"
                min="0"
              ></input>

              <label>Type of Questions</label>
              <select
                name="typeOfQuestions"
                ref={register}
                className={`form-control`}
                required
              >
                {[
                  TypeSelection_Enum.SINGLE_CHOICE,
                  TypeSelection_Enum.MULTI_SELECT,
                  TypeSelection_Enum.TRUE_FALSE,
                ].map(i => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>

              {watchTypeOfQuestions !== TypeSelection_Enum.TRUE_FALSE && (
                <label>Number of Fields Per Question</label>
              )}
              {watchTypeOfQuestions !== TypeSelection_Enum.TRUE_FALSE && (
                <input
                  name="numberOfFields"
                  defaultValue="3"
                  ref={register}
                  className={`form-control`}
                  required
                  type="number"
                  min="0"
                ></input>
              )}
            </div>
          </div>
          <div className="row">
              <div className="col">
              {watchTypeOfQuestions !== TypeSelection_Enum.TRUE_FALSE && (
                <label>Min Selection Per Question</label>
              )}
              {watchTypeOfQuestions !== TypeSelection_Enum.TRUE_FALSE && (
                <input
                  name="min_selection_count"
                  defaultValue="1"
                  ref={register}
                  className={`form-control`}
                  required
                  type="number"
                  min="0"
                ></input>
              )}
              </div>
              <div className="col">
              {watchTypeOfQuestions !== TypeSelection_Enum.TRUE_FALSE && (
                <label>Max Selection Per Question</label>
              )}
              {watchTypeOfQuestions !== TypeSelection_Enum.TRUE_FALSE && (
                <input
                  name="max_selection_count"
                  defaultValue="1"
                  ref={register}
                  className={`form-control`}
                  required
                  type="number"
                  min="0"
                ></input>
              )}
              </div>
            </div>


        </div>
        {questionNumbers().map(i => (
          <div key={i} className="list-group list-group-flush">
            <div className="list-group-item">
              <h5 className="card-title">Question {i + 1} </h5>
              <div className="form-row">
                <div className="form-group col-6">
                  <label>Description</label>
                  <input
                    name={`questions[${i}].question_description`}
                    ref={register}
                    type="text"
                    className={`form-control`}
                  />
                  <div className="invalid-feedback">
                    {errors.questions?.[i]?.question?.message}
                  </div>
                </div>
                <div className="form-col col-6">
                  <label>Options:</label>
                  {numberOfFields().map(j => (
                    <div className="field-value" style={{marginBottom:15}}>
                      <input
                        name={`questions[${i}].options[${j}].option_description`}
                        ref={register}
                        type="text"
                        className={`form-control`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="card-footer text-center border-top-0">
          <button type="submit" className="btn btn-primary mr-1">
            Submit
          </button>
          <button className="btn btn-secondary mr-1" type="reset">
            Reset
          </button>
        </div>
      </div>
    </form>
  );
}

export default withRouter(ElectionForm);
