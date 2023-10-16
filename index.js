// Map constants
const svg = d3.select("#usmap");
const svg2 = d3.select("#sideinfo");
const svg3 = d3.select("#buttons");
const width = svg.attr("width");
const height = svg.attr("height");
const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const mapWidth = width - margin.left - margin.right;
const mapHeight = height - margin.top - margin.bottom;
const map = svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
const sideDisp = svg2.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
let currYear = 1996;

/** Async function to draw the map */
const drawMap = async function () {
  // Import dataset
  const us = await d3.json("./data/us-smaller.json");

  // Map state variables
  var states = topojson.feature(us, us.objects.states);
  var statesMesh = topojson.mesh(us, us.objects.states);
  var projection = d3.geoAlbersUsa().fitSize([mapWidth, mapHeight], states);
  var path = d3.geoPath().projection(projection);

  // Adding graticule to go behind map
  let graticule = d3.geoGraticule10();
  map.append("path")
    .attr("class", "graticule")
    .attr("d", path(graticule));

  let i = -1;
  // Drawing the states
  let statePaths = map.selectAll("path.state").data(states.features)
    .join("path")
    .attr("class", "state")
    .attr("note", d => { i++; return i; })  // debugging
    .attr("d", path)
    .on('mouseover', mouseEntersState)
    .on('mouseout', mouseLeavesState);

  // Drawing state outlines
  map.append("path").datum(statesMesh)
    .attr("class", "state-outline")
    .attr("d", path);

  // Create zoom functionality
  var zoom = d3.zoom()
    .scaleExtent([1, 20])
    .translateExtent([[-50, -50], [mapWidth + 50, mapHeight + 50]])
    .on("zoom", mapZoomed);
  svg.call(zoom);

  // Initial execution of zoom behavior
  svg.call(zoom.transform, d3.zoomIdentity);

  // Create list of states
  const censusData = await d3.csv("./data/census_clean.csv")
  console.log(censusData)
  let statesList = []
  for (let i = 0; i <= 51; i++) {
    statesList.push(censusData[i].state);
  }
  console.log(statesList);

  // Import election datasets
  const stateElections = await d3.csv("./data/state_elections.csv");

  console.log(stateElections)

  const colorScale = d3.scaleOrdinal()
    .domain(["DEMOCRAT", "REPUBLICAN"])
    .range(["#88DBFF", "#EF5E5E"]);


  //let electionYr = 1976;

  const yearSet = new Set();
  stateElections.forEach(d => {
    yearSet.add(d.year);
  })
  console.log(yearSet);

  var slider = document.getElementById("myRange");

// Update the current slider value (each time you drag the slider handle)
  slider.oninput = function() {
    console.log(this.value);
    let y = this.value
    currYear = y
    updateStates(y);
  }


  // ------------------------ Helper/Callback functions ----------------------- //

  /** This function controls the zoom behavior of the map */
  function mapZoomed({ transform }) {
    // Apply transformation
    map.attr("transform", transform);

    // Divide by scale to keep strokes at a consistent width during zooming
    map.select(".state-outline")
      .style("stroke-width", 1 / transform.k);
  }

  /** This function defines the behavior for when a mouse enters a State */

  sideDisp.append('text').text('Hover over a state to reveal more information').attr('class', 'stateData')

  function mouseEntersState() {

    d3.selectAll(".stateData").remove()

    let state = d3.select(this);

    console.log("State")
    console.log(state.attr("note"))
    //state.style( "fill", function(d){console.log(d);return d3.rgb(d.color).darker(0.5); });
    state.style("fill",function() {
      return d3.rgb(d3.select(this).style("fill")).darker(0.5);});
    // console.log("Mouse entered state")

    let colorScale = d3.scaleOrdinal().domain(['REPUBLICAN', 'DEMOCRAT', 'Swing']).range(['red', 'blue', 'black'])

    // Information Display

    //Display state population for chosen year
    let electionYear = Number(currYear);
    let censusYear = Math.floor(electionYear / 10) * 10;

    if(censusYear == electionYear) {
      censusYear = censusYear-10;
    }


    let stateName = statesList[state.attr("note")]
    let stateNameCaps = stateName.toUpperCase()

    let pop, popChange, popDensity, numReps, numRepsChange, popPerRep = 0;

    censusData.forEach(d => {
      if (d.state == stateName && d.year == censusYear) {
        pop = +d.pop;
        popChange = d.pop_change;
        popDensity = d.pop_density;
        numReps = +d.num_reps + 2;
        numRepsChange = d.num_reps_change;
        popPerRep = +d.pop_per_rep;
      }
    })

    // Display state name
    sideDisp.append("text")
        .attr("dy", "0em")
        .attr("font-size", "25px")
        .attr("class", "stateData")
        .text(stateName + " (Census Year " + censusYear + ")")
    sideDisp.append("text")
      .attr("dy", "1.25em")
      .attr("class", "stateData")
      .text("Population: " + pop.toLocaleString())
    sideDisp.append("text")
      .attr("dy", "2.5em")
      .attr("class", "stateData")
      .text("Population change: " + popChange + "%")
    sideDisp.append("text")
      .attr("dy", "3.75em")
      .attr("class", "stateData")
      .text("Population density: " + popDensity)
    sideDisp.append("text")
      .attr("dy", "5em")
      .attr("class", "stateData")
      .text("Number of representatives: " + numReps)
    sideDisp.append("text")
      .attr("dy", "6.25em")
      .attr("class", "stateData")
      .text("Number of rep. change: " + numRepsChange)
    sideDisp.append("text")
      .attr("dy", "7.5em")
      .attr("class", "stateData")
      .text("Population per representative: " + popPerRep.toLocaleString())
    sideDisp.append("text")
      .attr("dy", "7.5em")
      .attr("font-size", "25px")
      .attr("class", "stateData")
      .text(stateName + " Election Data " + electionYear)

    if (electionYear >= 1976) {

      let topCandidates = []
      let i = 0;
      let j = 4;
      let k = 0;
      let hist = [];
      let partiesList = ["DEMOCRAT", "REPUBLICAN"]

      stateElections.forEach( d => {

        if(d.state == stateNameCaps && d.year == electionYear && i<2 && partiesList.includes(d.party_simplified)){
          i++;
          topCandidates.push(d);
        }

        let pastYear = electionYear - (4*j)
        if(d.state == stateNameCaps && d.year == pastYear && j >= 0){
          j--;
          hist.push(d.party_simplified);
        }

      })

      let countSame = 0;
      let histState = "";

      hist.forEach( (d, i) => {
        let first = hist[0]
        let curr = hist[i]

        if(first == curr){
          countSame ++;
        }
      })

      if(Math.max(countSame, 5-countSame) >= 4){
        histState = hist[0];
      }else{
        histState = 'Swing'
      }

      let totalVotes = topCandidates[0].totalvotes
      let winnerVotes = +topCandidates[0].candidatevotes
      let loserVotes = +topCandidates[1].candidatevotes
      let winnerVotesPct = (winnerVotes / totalVotes * 100).toFixed(2)
      let loserVotesPct = (loserVotes / totalVotes * 100).toFixed(2)

      sideDisp.append("text")
          .attr("dy", "13em")
          .attr("class", "stateData")
          .text(topCandidates[0].candidate.toLowerCase() + " " + winnerVotes.toLocaleString() +" (" + winnerVotesPct + "%) votes")
          .style("text-transform", "capitalize")
          .style('fill', colorScale(topCandidates[0].party_simplified))

      sideDisp.append("text")
          .attr("dy", "14.25em")
          .attr("class", "stateData")
          .text(topCandidates[1].candidate.toLowerCase() + " " + loserVotes.toLocaleString() +" (" + loserVotesPct + "%) votes")
          .style("text-transform", "capitalize")
          .style('fill', colorScale(topCandidates[1].party_simplified))

      if(electionYear >= 1992){
        sideDisp.append("text")
            .attr("dy", "15.5em")
            .attr("class", "stateData")
            .text('Historically a ')
            .style("text-transform", "capitalize")

        sideDisp.append("text")
            .attr("dy", "15.5em")
            .attr("dx", "6em")
            .attr("class", "stateData")
            .text(histState + ' state')
            .style("text-transform", "capitalize")
            .style('fill',  colorScale(histState))
      }else{
        sideDisp.append("text")
            .attr("dy", "15.5em")
            .attr("class", "stateData")
            .text('Insufficient data to determine historical voting')
            .style("text-transform", "capitalize")
      }
    } else {
      sideDisp.append("text")
        .attr("dy", "13em")
        .attr("class", "stateData")
        .text("No state voting data for selected year: " + electionYear)
    }

  }

  /** This function defines the behavior for when a mouse exits a State */
  function mouseLeavesState() {
    let state = d3.select(this);
    state.style("fill",function() {
      return d3.rgb(d3.select(this).style("fill")).brighter(0.5);});

    // console.log("Mouse exited state")
  }

  function updateStates(yearKey) {

    let seenls = [];
    let res = [];
    stateElections.forEach(d => {
      if (d.year == yearKey && (seenls.includes(d.state) == false)) {
        res.push(d);
        seenls.push(d.state);
      }
    });

    let winners = [];

    res.forEach(d => {
      winners.push(d.party_simplified);
    })

    map.selectAll("path.state")
      .style("fill", function() {
         let state = d3.select(this);
         console.log(state.attr("note"));
         return colorScale(winners[state.attr('note')])
        });
  }

  updateStates(1996);
}

drawMap();
