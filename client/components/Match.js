/* eslint-disable no-shadow */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getMatch, sendDecision, sendEmailToMatch } from '../store/match';
import { Link } from 'react-router-dom'
import { getDistance }  from '../../utils/mathFuncs'
import Chatrooms from './Chatrooms'
import DogInfo from './Profile/DogInfo'
import UserInfo from './Profile/userInfo'
import {Button} from '@material-ui/core'
import Cards from './Profile/Cards'
import IconButton from '@material-ui/core/IconButton';
import ChatIcon from '@material-ui/icons/Chat';

class Match extends Component {
    constructor(props){
        super(props);
        this.state = {
            message: ''
        }
        this.sendDecisionAndLoadNextMatch = this.sendDecisionAndLoadNextMatch.bind(this)
        this.sendToChat = this.sendToChat.bind(this)
    }
    componentDidMount(){
        const { getMatch, user } = this.props;
        getMatch(user.id, user.userLatitude, user.userLongitude)
    }
    async sendDecisionAndLoadNextMatch(decision){
        try {
            const { getMatch, user, match, sendDecision, sendEmailToMatch } = this.props;
            const matchResult = await sendDecision(user.id, match.id, decision);
            if (matchResult.result === 'Matched') {
                // saving current match in variable before calling getMatch again. email takes too long to send with await.
                sendEmailToMatch(user, match)
                getMatch(user.id, user.userLatitude, user.userLongitude)
                this.setState({ message: `${user.firstName}, you have matched with ${match.firstName}! Send them a message now: ` })
            }
            else {
                getMatch(user.id, user.userLatitude, user.userLongitude)
                this.setState( { message: ''} )
            }
        } catch (err) { console.error(err); }
    }
    sendToChat(match){
        this.props.history.push({
            pathname: '/chat',
            state: {
                matchId: match.id,
                type: 'matchPage'
            }
        })
        // return (
        //     <Chatrooms type="matchPage" match = {match} />
        // )
    }
    render(){
        let { match, user } = this.props;
        let matchDistanceFromUser = parseInt(getDistance(user.userLatitude, user.userLongitude, match.userLatitude, match.userLongitude))

        if (!user) {
            return (
                <div id="chatContainer">
                    <div id="chatBody">
                        <Link id="notLoggedInMessage" to='/login'>Please Log In To See Matches</Link>
                    </div>
                </div>
            )
        }

        else if (match.message) {
            return (
            <div id="matchContainer">
                {match.message}
            </div>
            )
        }

        else if (!match.message && !match.firstName ) {
            return (
            <div id="chatContainer">
                Loading....
            </div>
        )}

        else {
            return (
            <>
            <div id="profileContainer">
                <div id="profileBody">
                    <h3>{match.firstName} and {match.dog.dogName}
                    </h3>
                    {match.liked ?
                    <div id = "userLikedMatch">
                        <img  src = '/images/heartImage.png' />
                        <div>This user liked you!</div>
                    </div>
                    : <div />
                    }
                    <Cards user = {match} />
                    <div id="matchButtonsContainer">
                        <Button className="rejectMatchButton" onClick={() => {this.sendDecisionAndLoadNextMatch('reject')}} variant="contained" color="secondary" type="submit">Don't like</Button>
                        <Button className="acceptMatchButton" onClick={() => {this.sendDecisionAndLoadNextMatch('like')}} variant="contained" color="secondary" type="submit">Like</Button>
                    </div>
                    {/* Match user ID for debugging purposes, will take out */}
                    {/* <p>Match User Id: {match.id}</p> */}
                    <span>{this.state.message}</span>
                    {/* { this.state.message.includes('you have matched') ? <Chatrooms type="matchPage" match = {match} /> : null} */}
                    { this.state.message.includes('you have matched') ?
                        <Link to="/chat" >
                            <IconButton onClick={() => this.sendToChat(match)} >
                                <ChatIcon title="Chat with your match"/>
                            </IconButton>
                        </Link>
                    : null}
                </div>
                <div id="infoBody">
                    <UserInfo user = {match} />
                    <DogInfo dog = {match.dog} />
                </div>
            </div>
            </>
            )
        }
    }
}

const mapStateToProps = (state) => ({
    match: state.match,
    user: state.user,
});

const mapDispatchToProps = (dispatch) => ({
    getMatch: (userId, userLatitude, userLongitude) => dispatch(getMatch(userId, userLatitude, userLongitude)),
    sendDecision: (userId, matchId, decision) => (dispatch(sendDecision(userId, matchId, decision))),
    sendEmailToMatch: (user, match) => dispatch(sendEmailToMatch(user, match))
});

export default connect(mapStateToProps, mapDispatchToProps)(Match);
