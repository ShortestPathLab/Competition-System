import React from "react";
import { Grid, Paper, Card, Divider, Typography} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import banner from "./images/banner.png"
import CircularProgress from '@material-ui/core/CircularProgress';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import mathjax from 'rehype-mathjax'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {oneLight} from 'react-syntax-highlighter/dist/esm/styles/prism'
import rehypeRaw from 'rehype-raw'
import ReactHtmlParser from "react-html-parser";


const useStyles = theme => ({
    app:{
        [theme.breakpoints.down('xs') ]: {
            paddingLeft: theme.spacing(0),
            paddingRight: theme.spacing(0),
            width:"100%",
            margin:0,
        },
        width:"100%",
        paddingLeft: theme.spacing(4),
        paddingRight: theme.spacing(4),
        margin:0,
        minHeight:"50vh",
    },
    appNoMargin:{
        width:"100%",
        margin:0,
    },
    appNews:{
        [theme.breakpoints.down('xs') ]: {
            paddingLeft: theme.spacing(0),
            paddingRight: theme.spacing(0),
            width:"100%",
            margin:0,
        },
        width:"100%",
        paddingLeft: theme.spacing(4),
        paddingRight: theme.spacing(4),
        margin:0,
    },
    titleBox:{
        width:"100%",
        overflow:"hidden",
        textAlign:"center"

    },
    titleImage:{
        width:"100%",
    },
    landingPaper:{
        [theme.breakpoints.down('xs') ]: {
            width:"100%",
            padding: theme.spacing(2),
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),

        },

        width:`100%`,
        // minHeight:"80%",
        maxWidth:"1280px",
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: theme.spacing(1),
        padding: theme.spacing(5)
    },
    news_panel:{
        [theme.breakpoints.down('xs') ]: {
            width:"100%",
            padding: theme.spacing(2),
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),

        },

        width:`100%`,
        // minHeight:"80%",
        maxWidth:"1280px",
        // maxHeight:theme.spacing(5),
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: theme.spacing(3),
        paddingLeft: theme.spacing(5),
        paddingRight: theme.spacing(5),
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),

    },

    noMargin:{
        width:"100%",
        padding: theme.spacing(3)
    },
    loading:{
        margin:"auto",
        // width:"100%",
        textAlgin:"center"
    },
    circular:{
        margin:"auto"
    },
    home:{
        padding:theme.spacing(2)
    },
    mdContainer:{
        width:"100%",
    },
    inlineCode: {
        display: "inline",
        padding: "0 4px",
        backgroundColor: theme.palette.grey[300],
        // color: "white",
        borderRadius: "2px",
    },
    mdQuote:{
        backgroundColor:theme.palette.grey[200],
        padding: theme.spacing(1),
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),

    },
    mdImage:{
        display:"inherit",
        marginLeft:"auto",
        marginRight:"auto", 
        maxWidth: `100%`
    },
    mdP:{
        width:"100%",
        [theme.breakpoints.down('xs') ]: {
            paddingLeft: theme.spacing(0),
            paddingRight: theme.spacing(0),
        },
        // having indention to make text look better,        
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        margin:0,
        // paddingTop: theme.spacing(2),

        
    },
    mdPp:{
        
    },
    mdTable:{
        [theme.breakpoints.down('xs') ]: {
            paddingLeft: theme.spacing(0),
            paddingRight: theme.spacing(0),
        },
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        width:"100%",
        // maxWidth:"1024px",
        // tableLayout: "auto"
    },
    mdTdImg:{
        borderBottom: "0",
        paddingLeft:theme.spacing(1),
        paddingRight:theme.spacing(1),
        verticalAlign:"bottom",
        textAlign:"center",

    },
    mdTdText:{
        borderBottom: "0",
        paddingLeft:theme.spacing(1),
        paddingRight:theme.spacing(1),
        verticalAlign:"center",
        textAlign:"center",


    },
    mdH2:{
        display:"inline",
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),

    },
    mdTbody:{
        // width:"100%",
    },
    mdDiv:{
        display: "flex",
        justifyContent: "space-between",

    },
    htmlTable:{
        margin:"auto",
        border: "none",
        borderCollapse: "collapse"
    },
    htmlTd:{
        padding:theme.spacing(1),
        border: "none",
        borderCollapse: "collapse"
    }

  });



class ExternalPage extends React.Component {

  
    constructor(props) {
        super(props);
        //get the with of current component
        this.state = {
          external_resource: undefined,
          page: this.props.page,
        }
        this._ismounted = false;
        this.page_load_time = undefined;
        fetch(`/external_page/${this.props.page}`, {
            method: 'GET',
        })
        .then(res =>res.text())
        .then(res => {
            this.page_load_time = new Date();
            if (!this._ismounted)
                this.state.external_resource = res;
            else
                this.setState({external_resource: res});
        })
        .catch(err => {
            console.error(err);
        });
    }

    componentDidMount() { 
        this._ismounted = true;
      }
      
    componentWillUnmount() {
        this._ismounted = false;
    }

    // componentDidMount(){
    //     if (this.state.external_resource===undefined ){
    //         fetch(`/external_resource/${this.props.page}`, {
    //             method: 'GET',
    //         })
    //         .then(res =>res.text())
    //         .then(res => {
    //             this.page_load_time = new Date();
    //             this.setState({external_resource: res});
    //         })
    //         .catch(err => {
    //             console.error(err);
    //         });
    //     }
    // }

    renderers = {
        //This custom renderer changes how images are rendered
        //we use it to constrain the max width of an image to its container
        img: (props) => {
            const {alt, src, title , ...rest} = props
            return (<img 
                loop="infinite"
                alt={alt}
                src={src}
                title={title}
                {...rest}
                className={this.props.classes.mdImage} 
                />);
        },
        code: ({node, inline, className, children, ...props})=> {
            const match = /language-(\w+)/.exec(className || '')
            return !inline ?(
              <SyntaxHighlighter
                {...props}
                children={String(children).replace(/\n$/, '')}
                style={oneLight}
                language={match ? match[1]:""}
                PreTag="div"
              />
            ) : (
                <Card elevation={0} className={this.props.classes.inlineCode} >
                    <code >{children}</code>
                </Card>
            )
        },
        h2: (props) => {
            // console.log(children.children[0] )
            var {children,node,...props} = props;

            return (
                <div>
                    <span className={this.props.classes.mdDiv}>
                        <h2 className={this.props.classes.mdH2} {...props}>{children[0]}</h2>
                        { children[1] && children[1].type.name === "img"&& <img style={{height:"60px",width:"auto"}} {...children[1].props}></img>}
                        { children[1] && children[1].type.name === "code"&& <a style={{height:"20px",width:"auto",whiteSpace: 'nowrap', alignSelf: "flex-end", marginBottom:"16px"}} {...children[1].props}></a>}

                    </span>
                    
                    <Divider/>
                </div>
            )
        },
        blockquote: (props) => {
            // make the blockquote with a grey background
            var {node,...props} = props;

            return (
                <div className={this.props.classes.mdQuote} >
                    <blockquote {...props} />
                </div>
            )
        },
        p:(props) => {
            var {node,...props} = props;

            // make p tag some padding
            // console.log(props)
            return (
                <div className={this.props.classes.mdP}>
                    <p  className={this.props.classes.mdPp} {...props} />
                </div>
            )
        },
        table:(props) => {
            var {node,...props} = props;

            // make table tag some padding
            if (this.props.rawTable){
                return (
                    <table className={this.props.classes.htmlTable} {...props} />
                )
            }
            return (
                <table className={this.props.classes.mdTable} {...props} />
            )
        },
        td:(props) => {
            var {node,...props} = props;


            if (this.props.rawTable){

                return (
                    <td className={
                        this.props.classes.htmlTd
                    } {...props} />
                )
            }
            let children = props.children;

            // make table tag some padding
            let string = children?typeof(children[0])==="string":false;
            let img = false;
            if (children && children[0] && children[0].type && children[0].type.name==="img"){
                img = true;
            }
            return (
                <td className={img? this.props.classes.mdTdImg:this.props.classes.mdTdText} {...props} />
            )
        },
        tbody:(props) => {
            var {node,...props} = props;
            // make table tag some padding
            if (this.props.rawTable){
                return (
                    <tbody {...props} />
                )
            }
            return (
                <tbody className={this.props.classes.mdTbody} {...props} />
            )
        }

        
    };


    
    renderHTML(){
        return(
            ReactHtmlParser(this.state.external_resource)
        )
    }
    
    renderMD(){
        const { classes } = this.props;
        return(
            <div 
                className={classes.mdContainer}
            >
                {this.props.md && this.state.external_resource &&

                    //use react markdown with extra plugins to render github flavored markdown
                    <ReactMarkdown 
                    className={classes.mdContainer}
                    rehypePlugins={[rehypeRaw,mathjax]} 
                    remarkPlugins={[remarkGfm,remarkMath]}
                    //components that limit the width of images
                    components={this.renderers}
                    >
                    {
                        this.state.external_resource
                    }
                    </ReactMarkdown>





                }


            </div>
            
        )
    }

    render(){
        const { classes } = this.props;
        return (
            <div>
                <Grid container spacing={0} className={this.props.noMargin == true? classes.appNoMargin: this.props.news? classes.appNews: classes.app}>
                {/* {this.props.news && <Paper elevation={10} className={classes.news_pannel} >
                    🚀 <b>Latest News</b> - 2023-08-28 - <a href="./news">Main round is here! Start-kit v1.1.2 release! PlanViz 1.2.0 release!</a>  

                    </Paper>} */}
                <Paper elevation={10} className={this.props.noMargin == true? classes.noMargin: this.props.news? classes.news_panel : classes.landingPaper}>
                
                {!this.state.external_resource && <div className={classes.loading}>
                    <CircularProgress  className={classes.circular} color="secondary" />
                </div>}
                {!this.props.md && this.state.external_resource && this.renderHTML()}
                {this.props.md && this.renderMD()}
                {this.props.children && this.props.children}
                </Paper>
                </Grid>
                
            </div>
        
        )
    }
}

export default withStyles(useStyles) (ExternalPage);