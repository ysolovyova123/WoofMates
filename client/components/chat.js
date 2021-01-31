import React from 'react';
import VideoChat from './VideoChat/VideoChat';
import firebaseDB from './Firebase';
import classnames from 'classnames';
import IconButton from '@material-ui/core/IconButton';
import PhoneIcon from '@material-ui/icons/Phone';
import SpeakerNotesOffIcon from '@material-ui/icons/SpeakerNotesOff';

class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chats: [],
            message: '',
            readError: null,
            writeError: null,
            videoChat: false
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.openVideo = this.openVideo.bind(this);
        this.closeVideo = this.closeVideo.bind(this);
    }

    async componentDidMount() {
        this.setState({
            readError: null
        });

        try {
            firebaseDB.ref(`${this.props.from}-${this.props.to}/chats`).on("value", snapshot => {
                let chats = [];
                snapshot.forEach(snap => {
                    chats.push(snap.val());
                });
                this.setState({ chats });
            });
        } catch (error) {
            this.setState({ readError: error.message })
        }
    }

    handleChange(event) {
        this.setState({
            message: event.target.value
        })
    }

    async handleSubmit(event) {
        event.preventDefault();
        this.setState({
            writeError: null
        })
        const today = new Date();
        const hours = (today.getHours() % 12) < 10 ? `0${today.getHours() % 12}` : today.getHours();
        const minutes = today.getMinutes() < 10 ? `0${today.getMinutes()}` : today.getMinutes();
        const seconds = today.getSeconds() < 10 ? `0${today.getSeconds()}` : today.getSeconds();
        const ampm = today.getHours() < 12 ? ' AM' : ' PM'
        const time = hours + ":" + minutes + ampm;
        try {
            await firebaseDB.ref(`${this.props.from}-${this.props.to}/chats`).push({
                message: this.state.message,
                timestamp: time,
                from: this.props.fromName,
                to: this.props.toName
            });
            await firebaseDB.ref(`${this.props.to}-${this.props.from}/chats`).push({
                message: this.state.message,
                timestamp: time,
                from: this.props.fromName,
                to: this.props.toName
            });
        } catch (error) {
            this.setState({
                writeError: error.message
            })
        }
        this.setState({
            message: ''
        })
    }

    openVideo() {
        this.setState({
            videoChat: true
        })
    }

    closeVideo() {
        this.setState({
            videoChat: false
        })
    }

    render() {
        const { chats, videoChat } = this.state;

        if (videoChat) {
            return (
                <div>
                    <VideoChat fromName={this.props.fromName} toName={this.props.toName} closeVideo={this.closeVideo}/>
                </div>
            )
        } else {
            return (
                <div>
                    <div id='chatButtons'>
                        <IconButton onClick={this.openVideo} >
                            <PhoneIcon />
                        </IconButton>
                        <IconButton onClick={this.props.closeChat}>
                            <SpeakerNotesOffIcon />
                        </IconButton>
                    </div>
                    <div id="ChatBody">
                        {
                            chats.map(chat => {
                                return (
                                    <p className={classnames({recipient: this.props.fromName !== chat.from}, {sender: this.props.fromName === chat.from})} key={chat.timestamp}>
                                        <span className='messages'>{chat.message}</span>
                                        <span className='timestamp'>{chat.timestamp}</span>
                                    </p>
                                )
                            })
                        }
                    </div>
                    <form id = "chatTypeMessageForm" onSubmit={this.handleSubmit}>
                        <input id="chatTextInputField" style={{float: 'right'}} onChange={this.handleChange} value={this.state.message}></input>
                        <button id="chatSendButton" style={{float: 'right'}} type="submit">Send</button>
                        {this.state.writeError ? <p>{this.state.writeError}</p> : null}
                    </form>
                </div>
            )
        }
    }
}

export default Chat;
