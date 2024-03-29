import '../css/App.css'
import { 
    withRouter, 
    Switch, 
    Route,
    useRouteMatch,
    useParams
} from "react-router-dom";
import { getReq } from '../utils/customAxiosLib'
import { useState, useEffect} from 'react';

const ElectionVoteDetails = props => {
    const [electionResults, setElectionResults] = useState({
        "election_info": {
            "anonymous": true,
            "election_description": "test_elec",
            "election_id": 10,
            "end_time": "2024-01-23T04:56:07+00:00",
            "org_id": 10,
            "public_results": true,
            "questions": [
                {
                    "election_id": 10,
                    "max_selection_count": 2,
                    "min_selection_count": 2,
                    "options": [
                        {
                            "option_description": "",
                            "option_id": 20,
                            "result": 0.0,
                            "total_votes_for": 0
                        }
                    ],
                    "ordered_choices": false,
                    "question_description": "No Results Yet, Stay Tuned.",
                    "question_id": 10
                },

            ],
            "start_time": "2000-01-23T04:56:07+00:00",
            "verified": true
        },
        "org_info": {
            "name": "yo sooonnn mollit",
            "org_id": 10
        }
    });
    let { election_id } = useParams();
    useEffect(() => {
        getReq(`/org/elections/results?election_id=${election_id}`).then(response => {
            if (response.status === 200) {
                console.log("Got Election");
                setElectionResults(response.data);
            }
        })
        .catch(error => {
            console.log("Failed to get electionResults.");
            console.log(error);
        });
    }, [election_id]);

    return electionResults.election_info.questions.map((question, index) => {
        let rank = 0;
        let last = -1;

        return (
            <div key={question.question_id}>
                <h2>{question.question_description}</h2>
                <table id="org">
                    <tbody>
                    <tr>
                        <th>Rank</th>
                        <th>Option</th>
                        <th>Result</th>
                        <th>Number of Votes</th>
                    </tr>
                        {question.options.sort((a,b) => (a.result < b.result) ? 1 : -1).map((option, index) => {
                            if (last !== option.result) rank++
                            last = option.result;
                            return (
                            <tr key={option.option_id}>
                                <td>{rank}</td>
                                <td>{option.option_description}</td>
                                <td>{Number.parseFloat(option.result).toPrecision(4)}%</td>
                                <td>{option.total_votes_for}</td>
                            </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        );
    });
}

const renderTableHeader = () => {
    return (
        <tr>
            <th key={0}>ID</th>
            <th key={1}>ELECTION DESCRIPTION</th>
            <th key={2}>START TIME</th>
            <th key={3}>END TIME</th>
            <th key={4}>ORG ID</th>
        </tr>
    );
}

const renderTableData = (electionList, redirectToElectionDetails) => {
    return electionList.map((election, index) => {
        const {election_description, election_id, end_time,
        start_time, org_id} = election;
        return (
        <tr 
        key={index}
        onClick={() => {
            redirectToElectionDetails(election_id, election_description)
        }}
        >
            <td>{election_id}</td>
            <td>{election_description}</td>
            <td>{start_time}</td>
            <td>{end_time}</td>
            <td>{org_id}</td>
        </tr>
        );
    });
}

const ElectionResults = (props) => {

    let { path } = useRouteMatch();

    const redirectToElectionDetails = (id, name) => {
        console.log("[ + ] Redirecting to view details of " + name);
        props.history.push(`/electionResults/electionDetails/${id}`);
    }
    const [listState, setState] = useState([{
        anonymous : "",
        election_description: "",
        election_id: 0,
        end_time: "",
        start_time: "",
        ord_id: 0
    }]);
    useEffect(() => {
        getReq("/org/elections/public/get/list?page=1&elections_per_page=333").then(response => {
            if (200 <= response.status && response.status < 300) {
                setState(response.data.elections.filter(election => election.public_results === true))
            }
        })
        .catch(error => {
            console.log(error);
        });
    }, []);
    

    return (
        <Switch>
        <Route exact path={path}>
        <div>
            <h2 className='title'>Public Elections List</h2>
            <table id="org">
                <tbody>
                    {renderTableHeader()}
                    {renderTableData(listState, redirectToElectionDetails)}
                </tbody>
            </table>
        </div>   
        </Route>
        <Route path={`/electionResults/electionDetails/:election_id`}>
        <ElectionVoteDetails />
        </Route>
        </Switch>
    );
}
export default withRouter(ElectionResults);
export { ElectionVoteDetails }