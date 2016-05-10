/**
 * Created by Steve Muchow on 5/10/16.
 * Copyright (c) 2016 Steven Muchow
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the
 * Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 
 *  
 */

/**
 * returns an object containing an array of years where the most people lived over a span of time.
 * It does not count people who lived or died beyond the range.
 * Assuming a range of 1900-2000...
 *    If someone is born in 1899 and dies in 1904, the results will skew, because no record
 *    of the birth is recorded. There will not be a 1-1 mapping of birth increments and death
 *    decrements.
 *    This code simply removes those entries from the set.
 * 
 * @param startYear - the year to start the test
 * @param endYear - the year to end the test
 * @param peopleList - an array of people objects with birthYear and deathYear.
 * @return object containing an array of the years matching and the counted sample size
 *     {
 *       numSamplesSubmitted : 0, // number of potential samples
 *       largestPopulationYears : [], // the list of years with the largest populations
 *       numberOfSamplesRecorded: 0, // identifies rejections
 *       maxPopulationRecorded: 0
 *     }
 * 
 */
function findYearsWithTheLargestPopulation(startYear, endYear, peopleList) {

    var populationData = {
        numSamplesSubmitted: peopleList.length,
        largestPopulationYears : [],
        numberOfSamplesRecorded : 0,
        maxPopulationRecorded: 0
    };

    // sanity check - make sure years are ascending then initialize an array
    if (endYear < startYear) {
        return populationData;
    }
    var populationDeltaByYear = allocateAndFillAnArray(endYear-startYear+1,0);

    // add people's life and death markers to the master array. This is a delta recording mechanism.
    peopleList.forEach( function(person) {
        if (person.birthYear && person.deathYear) { // no undefineds
            if (person.deathYear >= person.birthYear) { // boundscheck for sanity
                if (person.birthYear>=startYear && person.deathYear<=endYear) {
                    populationDeltaByYear[person.birthYear-startYear]++;
                    populationDeltaByYear[person.deathYear-startYear]--;
                    populationData.numberOfSamplesRecorded++;
                }
            }
        }
    });

    debugPopInfo(populationDeltaByYear);

    // populationDeltaByYear now contains all the birth/death results. Iterate through to
    // find all the maximums. This asssumes a steady-state population. Each birth and
    // death adds a 'ripple' to the norm and this captures it.
    var yearsMatching = [];
    var maxPopulationFound = 0;
    var totalPopulation = 0;
    populationDeltaByYear.forEach( function (populationCount, index) {
        totalPopulation += populationCount;
        if (totalPopulation > maxPopulationFound) {
            yearsMatching = []; // start over
            yearsMatching.push(index+startYear);
            maxPopulationFound = totalPopulation;
        }
        else if (totalPopulation == maxPopulationFound) {
            yearsMatching.push(index+startYear);
        }
    });
    
    // shallow copy the array - since we are dealing with numbers
    populationData.maxPopulationRecorded = maxPopulationFound;
    populationData.largestPopulationYears =  yearsMatching.slice();
    return populationData;
}

function allocateAndFillAnArray(size, fill) {
    var array = [];
    array = Array.apply(null, Array(size)).map(Number.prototype.valueOf,fill); // js madness...
    return array;
}
function debugPopInfo(deltaPopulationList) {
    console.log('Population Deltas By Year:');
    console.log(JSON.stringify(deltaPopulationList));

    //
    var currentSize = 0;
    var populationSize = [];
    deltaPopulationList.forEach( function(num) {
        currentSize += num;
        populationSize.push(currentSize);
    });
    console.log('Population Size By Year:');
    console.log(JSON.stringify(populationSize));
}


var testPeopleList =  
[
    { birthYear : 1900, deathYear: 1962 },
    { birthYear : 1903, deathYear: 1962 },    
    { birthYear : 1922, deathYear: 1947 },
    { birthYear : 1972, deathYear: 1962 },
    { birthYear : 1899, deathYear: 1962 },
    { birthYear : 1900 },
    { birthYear : 1922, deathYear: 1958 },
    { birthYear : 1945, deathYear: 1969 },
    { birthYear : 1972, deathYear: 1980 },
    { birthYear : 1973, deathYear: 1980 },
    { birthYear : 1973, deathYear: 1980 },
    { birthYear : 1977, deathYear: 1980 },
    { birthYear : 1978, deathYear: 1980 }

];

function runPeopleSamples (peopleList, testName) {
    console.log('===================================\n' + testName + '\n  Source Data: ');
    peopleList.forEach(function(person,index) {
        console.log('    ' + index + ': ' + JSON.stringify(person));
    });

    var testResult = findYearsWithTheLargestPopulation(1900,2000,peopleList);

    console.log('Population Results:')
    console.log(JSON.stringify(testResult));
}

runPeopleSamples(testPeopleList, 'Controlled Test:');

var randomPeopleList = [];
for (var i=0; i<100; i++) {
    var date1 = Math.floor(Math.random() * 101) + 1900;
    var date2 = Math.floor(Math.random() * 101) + 1900;

    randomPeopleList.push(
      {
          birthYear: ((date1<date2)?date1:date2),
          deathYear: ((date1<date2)?date2:date1)
      }
    );
}
runPeopleSamples(randomPeopleList, 'Random Test:');
