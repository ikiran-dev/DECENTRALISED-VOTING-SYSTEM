App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    hasVoted: false,

    
  
    init: function () {
      return App.initWeb3();
    },
  
    initWeb3: function () {
      // TODO: refactor conditional
      x=6;
      if (x!=6){
        window.location.href = "404.html";
  
      }else {
        
      if (typeof web3 !== 'undefined') {
        // If a web3 instance is already provided by Meta Mask.
        const ethEnabled = () => {
          if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            return true;
          }
          return false;
        };
        if (!ethEnabled()) {
          alert(
            'Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!'
          );
        }
        web3 = window.web3;
        App.web3Provider = web3.currentProvider;
      } else {
        // Specify default instance if no web3 instance provided
        App.web3Provider = new Web3.providers.HttpProvider(
          'http://localhost:7545'
        );
        web3 = new Web3(App.web3Provider);
      }
      return App.initContract();
    }},
  
    initContract: function () {
      $.getJSON('Election.json', function (election) {
        // Instantiate a new truffle contract from the artifact
        App.contracts.Election = TruffleContract(election);
        // Connect provider to interact with contract
        App.contracts.Election.setProvider(App.web3Provider);
  
        App.listenForEvents();
  
        return App.render();
      });
    },
  
    // Listen for events emitted from the contract
    listenForEvents: function () {
      App.contracts.Election.deployed().then(function (instance) {
        // Restart Chrome if you are unable to receive this event
        // This is a known issue with Metamask
        // https://github.com/MetaMask/metamask-extension/issues/2393
        instance
          .votedEvent(
            {},
            {
              fromBlock: 0,
              toBlock: 'latest',
            }
          )
          .watch(function (error, event) {
            console.log('event triggered', event);
            // Reload when a new vote is recorded
            App.render();
          });
      });
    },
  
    render: async () => {
      var electionInstance;
      var loader = $('#loader');
      var content = $('#content');
  
      loader.show();
      content.hide();
  
      // Load account data
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        App.account = accounts[0];
        $('#accountAddress').html('Your Account: ' + App.account);
      } catch (error) {
        if (error.code === 4001) {
          // User rejected request
        }
        console.log(error);
      }
  
      // Load contract data
      App.contracts.Election.deployed()
        .then(function (instance) {
          electionInstance = instance;
          return electionInstance.candidatesCount();
        })
        .then(async (candidatesCount) => {
 
          const promise = [];
          for (var i = 1; i <= candidatesCount; i++) {
            promise.push(electionInstance.candidates(i));
          }
  
          const candidates = await Promise.all(promise);
          var labels=[];
          var values=[];
          
          for (var i = 0; i < candidatesCount; i++) {
            var id = candidates[i][0];
            var name = candidates[i][1];
            var voteCount = candidates[i][2].c;
            labels.push(name);
            values.push(voteCount);
            
          }
/*           console.log(candidates[0][2]);
          var labels=[candidates[0][1],candidates[1][1],candidates[2][1]];
          var values=[candidates[0][2].c,candidates[1][2].c,candidates[2][2].c];  */      
          createChart(labels, values);         
          return electionInstance.voters(App.account);
        })
        .then(function (hasVoted) {
          // Do not allow a user to vote
          if (hasVoted) {
            $('form').hide();
          }
          loader.hide();
          content.show();
        })
        .catch(function (error) {
          console.warn(error);
        });
    },
  
    castVote: function () {
      var candidateId = $('#candidatesSelect').val();
      App.contracts.Election.deployed()
        .then(function (instance) {
          return instance.vote(candidateId, { from: App.account });
        })
        .then(function (result) {
          // Wait for votes to update
          $('#content').hide();
          $('#loader').show();
        })
        .catch(function (err) {
          console.error(err);
        });
    },
  };
  
  $(function () {
    $(window).load(function () {


      App.init();
    });
  });
  
//create a function to create a pie chart from candidates data in the contract
function createChart(labels, values) {
  const chartEl = document.getElementById('chart');
  const statsEl = document.getElementById('winner');
  const intValues = values.map((value) => parseInt(value));
  const totalVotes = intValues.reduce((acc, curr) => acc + curr, 0);
  const maxIndex = intValues.indexOf(Math.max(...intValues));
  const minIndex = intValues.indexOf(Math.min(...intValues));

  if (chartEl.chart) {
    // If there is, destroy it
    chartEl.chart.destroy();
  }
  
  const chart = new Chart(chartEl, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: 'Votes',
        data: intValues,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#2ECC71']
      }]
    }
  });

  // Display the winning and losing statistics
  statsEl.innerHTML = `
    <div>
      <p>Total Votes: ${totalVotes}</p>
      <p>Current Leader: ${labels[maxIndex]} with ${intValues[maxIndex]} votes</p>
      <p>Last Place: ${labels[minIndex]} with ${intValues[minIndex]} votes</p>
    </div>
  `;
}

