$(document).ready

setTimeout(function() {

    var region = "national";
    var userQuery;
    var validInput;

// controls for the tab nav bar from bootstrap
    $('.chartbutton').click(function() {
        var project = $(this).attr("data-project");
        selectedChartProject = project;
        var chartContainer = $(this).attr("data-chart");
        setChartData(selectedChartProject, region, "kitchenContainer");
    });
    $('button').click(function() {
        $(this).siblings('button').removeClass('activeB');
        $(this).addClass('activeB');
    });
    $('.textTab').click(function() {
        $('button:not(:first)').removeClass('activeB');
        $('button:nth-child(1)').addClass('activeB');
    });



    var selectedChartProject = "major-kitchen-remodel";

    setChartData(selectedChartProject, "national", "fresh");

    // get lists of states for JQuery Autocomplete
    var cityNameList = [];
    var autocompleteList = [];
    var autoRegions = CvV.getRegions();
    for (var i = 0; i < autoRegions.length; i++) {
        var regionList = autoRegions[i];
        var statesInRegionList = regionList["states"];
        for (var k = 0; k < statesInRegionList.length; k++) {
            var state = statesInRegionList[k];
            var autocompleteStates = {
                value: state["display-name"],
                data: regionList["name"]
            };
            autocompleteList.push(autocompleteStates);
        }

        var autocompleteRegions = {
            value: regionList["display-name"],
            data: regionList["name"]
        };
        autocompleteList.push(autocompleteRegions);
    }
    // gets list of cities for JQuery Autocomplete
    var cities = CvV.getCities();
    for (var i = 0; i < cities.length; i++) {
        var autoCity = cities[i];
        var autocompleteCities = {
            value: autoCity["display-name"] + ", " + autoCity["state"]["abbreviation"],
            data: autoCity["region"]["name"]
        }
        autocompleteList.push(autocompleteCities);
        cityNameList.push(autocompleteCities["value"]);
    }


    // Region SVG urls
    var regionImagesList = [{
        "name": "east-north-central",
        "image-url": "http://images.hw.net/Brightspot/Remodeling/Interactives/CvV_2016/images/CvV_region_images/CVV_EastNorthCentral_250_trim.jpg"
    }, {
        "name": "east-south-central",
        "image-url": "http://images.hw.net/Brightspot/Remodeling/Interactives/CvV_2016/images/CvV_region_images/CVV_EastSouthCentral_250_trim.jpg"
    }, {
        "name": "mid-atlantic",
        "image-url": "http://images.hw.net/Brightspot/Remodeling/Interactives/CvV_2016/images/CvV_region_images/CVV_MidAtlantic_250_trim.jpg"
    }, {
        "name": "mountain",
        "image-url": "http://images.hw.net/Brightspot/Remodeling/Interactives/CvV_2016/images/CvV_region_images/CVV_Mountain_250_trim.jpg"
    }, {
        "name": "new-england",
        "image-url": "http://images.hw.net/Brightspot/Remodeling/Interactives/CvV_2016/images/CvV_region_images/CVV_NewEngland_250_trim.jpg"
    }, {
        "name": "pacific",
        "image-url": "http://images.hw.net/Brightspot/Remodeling/Interactives/CvV_2016/images/CvV_region_images/CVV_Pacific_250_trim.jpg"
    }, {
        "name": "south-atlantic",
        "image-url": "http://images.hw.net/Brightspot/Remodeling/Interactives/CvV_2016/images/CvV_region_images/CVV_SouthAtlantic_250_trim.jpg"
    }, {
        "name": "west-north-central",
        "image-url": "http://images.hw.net/Brightspot/Remodeling/Interactives/CvV_2016/images/CvV_region_images/CVV_WestNorthCentral_250_trim.jpg"
    }, {
        "name": "west-south-central",
        "image-url": "http://images.hw.net/Brightspot/Remodeling/Interactives/CvV_2016/images/CvV_region_images/CVV_WestSouthCentral_250_trim.jpg"
    }];

    // build array with URLs for region images
    var regionImages = [];
    for (var i = 0; i < regionImagesList.length; i++) {
        var regionImage = regionImagesList[i];
        var regionNameAndImage = {
            value: regionImage["name"],
            data: regionImage["image-url"]
        }
        regionImages.push(regionNameAndImage);
    }



    // setup JQuery Autocomplete function pulling from currencies[] array
    $('#autocomplete').autocomplete({
        autoSelectFirst: true,
        lookup: autocompleteList,
        onSelect: function(suggestion) {
            validInput = suggestion.value;
            region = suggestion.data;
            userQuery = suggestion.value;
        }
    });

    $("#searchfield").keydown(function(e) {
        if (e.keyCode === 13) {
            renderData();
        }
    });

    $('.go').click(renderData);


// populates the HighCharts bar chart and donut chart with data that corresponds to User query
    function setChartData(project, region, state) {
        if (typeof state === "undefined") {
            state === "update";
        }

        var data = CvV.getProjectData(project, region);
        var nationalData = CvV.getProjectData(project, "national");
        var regionalJobCost = CvV.filterNumber(data["job-cost"]);
        var nationalJobCost = CvV.filterNumber(nationalData["job-cost"]);
        var regionalResaleValue = CvV.filterNumber(data["value-at-sale"]);
        var nationalResaleValue = CvV.filterNumber(nationalData["value-at-sale"]);
        var barChart = $("#kitchenBar").highcharts();

        var pieChart = $("#kitchenPie").highcharts();
        var costRecouped = data["cost-recouped"];
        costRecouped = costRecouped.replace("%", "");
        costRecouped = parseFloat(costRecouped);

        var costRemainder = 100 - costRecouped;
        if (costRemainder <= 0) {
            costRemainder = 0;
        }


        var barChartSeries2 = [{
            type: 'column',
            name: 'National',
            data: [nationalJobCost, nationalResaleValue]
        }]
        var barChartSeries1 = {
            type: 'column',
            name: 'Regional',
            data: [regionalJobCost, regionalResaleValue]
        }

// prevents the bar chart from displaying national average data in the area that is meant to display regional data from User query
        if (region != "national") {
            barChartSeries2.push(barChartSeries1);
        }

        if (state === "fresh") {
            Highcharts.setOptions({
                lang: {
                    thousandsSep: ','
                }
            });
            $('#kitchenBar').highcharts({
                chart: {
                    style: {
                        fontFamily: 'Polaris Condensed, Helvetica, Arial, sans-serif'
                    },
                },
                colors: ["#00aced", "#6f6f6f"],
                title: {
                    text: 'Cost vs. Value'
                },
                yAxis: {
                    title: {
                        text: 'Cost'
                    },
                },
                xAxis: {

                    labels: {
                        style: {
                            fontSize: '16px'
                        },
                    },
                    categories: ['Job Cost', 'Resale Value']
                },
                tooltip: {
                    pointFormat: '{series.name} <br><strong>${point.y}</strong></b>'
                },
                labels: {
                    items: [{
                        html: '',
                        style: {
                            color: '#00aced'
                        }
                    }]
                },
                series: barChartSeries2
            });

            $('#kitchenPie').highcharts({
                colors: ["#ff900d", "#ffffff"],
                chart: {
                    style: {
                        fontFamily: 'Polaris Condensed, Helvetica, Arial, sans-serif'
                    },
                    type: 'pie',

                },
                title: {
                    text: '% Cost Recouped'
                },
                tooltip: {
                    formatter: function() {
                        return '<b>' + this.point.name + '</b>: ' + Math.round(this.percentage) + '%';
                    },
                    pointFormat: '{series.name} <br><strong>{point.y}%</strong>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            inside: true,
                            distance: -156,
                            // y: function(){chart.plotTop  + (chart.plotHeight * 0.25);},
                            formatter: function() {
                                var dataName = this.point.name;
                                if (dataName === '% Cost Recouped') {
                                    return this.point.y + "%";
                                }

                            },
                            style: {
                                fontSize: "28px"
                            }
                        }
                    }
                },

                series: [{
                    name: ' ',
                    innerSize: '50%',
                    animation: false,
                    data: [{
                        name: '% Cost Recouped',
                        y: costRecouped
                    }, {
                        name: 'Remainder',
                        y: costRemainder
                    }]
                }]
            });
        } else {
            pieChart.series[0].setData([{
                name: '% Cost Recouped',
                y: costRecouped
            }, {
                name: 'Remainder',
                y: costRemainder
            }]);
            barChart.series[0].setData([nationalJobCost, nationalResaleValue]);
            if (region != "national") {
                barChart.series[1].setData([regionalJobCost, regionalResaleValue]);
            }
        }
    };

// takes the User input from the JQuery Autocomplete search form and presents the data from the JSON API containing Cost vs Value data
    function renderData() {
        var userInput = $("#autocomplete").val();
        // Alert message to display on invalid submission
        if (userInput != validInput) {
            $("#alertMessage").append("<span>We're sorry, that didn't work. Try the name of a state instead.</span>");
        } else {
            // cleans the page of data tables and visualizations from the default data table and previous query results
            $(".nationalAverageDefaultTable").fadeOut(800).promise().then(function() {
                $(this).empty();
            });
            $(".hidden").removeClass("hidden");
            $(".regionalAverageContainer").removeClass("hidden3");
            $(".regionTable").empty();
            $("#location").empty();
            $("#tableHeaderRegionalBanner").empty();
            $("#regionIdentity").empty();
            $("#statesInRegion").empty();
            $("#citySpecificLeadingText").empty();
            $("#regionTrendHeader").empty();
            $("#regionTrendText").empty();
            $("#cityUrlList").empty();
            $(".cityDataDownload").empty();
            $(".citySpecificDownload").empty();
            $("#costVsValueData").empty();
            $(".regionImageContainer").empty();
            $("#alertMessage").empty();
            $(".nearestCity").addClass("hidden2");
            $(".nationalAverageContainer").addClass("hidden");


            setChartData(selectedChartProject, region, "fresh");




            // gets the region names
            var regionName = CvV.getRegionDisplayName(region);

            // gets the data by region
            var regionData = CvV.getRegionData(region);

            // gets the national average data
            var nationalAverage = CvV.getRegionData("national");

            // create list of city URLs to display in JQuery Automcomplete
            var downloadCities = [];
            var cityList = CvV.getCities(region);
            for (var i = 0; i < cityList.length; i++) {
                var city = cityList[i];
                var cityDownload = {
                    value: city["display-name"] + ", " + city["state"]["abbreviation"],
                    data: city["links"]["page"]
                }
                console.log(cityDownload);
                downloadCities.push(cityDownload);
                $("#cityUrlList").append('<li><a href="' + city["links"]["page"] + '">' + city["display-name"] + '  </a></li>');
            }


            // City specific download button appears
            for (var i = 0; i < cityNameList.length; i++) {
                var cityAndState = cityNameList[i];
                if (userQuery.toLowerCase() === cityAndState.toLowerCase()) {
                    $(".hidden2").removeClass("hidden2");
                    $(".cityDataDownload").append("Download market-specific data on " + userQuery + ".");
                }
            }
            // and is given a hyperlink
            for (var i = 0; i < downloadCities.length; i++) {
                var downloadCity = downloadCities[i];
                if (userQuery.toLowerCase() === downloadCity["value"].toLowerCase()) {
                    $(".citySpecificDownload").append("<a href='" + downloadCity["data"] + "'>" + "<img id='downloadButton1' class='downloadIcon' src='http://images.hw.net/Brightspot/Remodeling/Interactives/CvV_2016/images/cvv_download_button.svg'/>" + "</a>");
                }
            }

            // lightbox form for user to comlete if they wish to have access to metro-specific data
            $(".citySpecificDownload").click(showLightbox);
            $("#cityUrlList a").click(showLightbox);

            function showLightbox() {
                $(this).colorbox({
                    html: "<iframe src='" + $(".citySpecificDownload a, #cityUrlList a").attr("href") + "'  width='620px' height='640px' scrolling='auto' frameborder=style='backgroundcolor:#fff;text-decoration:none;'></iframe>"
                }, {
                    trapFocus: true
                }, {
                    escKey: true
                }, {
                    closeButton: true
                });
            };


            // render region image SVG
            for (var i = 0; i < regionImages.length; i++) {
                var image = regionImages[i];
                if (region === image["value"]) {
                    $(".regionImageContainer").append("<img src='" + image["data"] + "'/>");
                }
            }



            // find states in a region
            var regions = CvV.getRegions();
            for (var i = 0; i < regions.length; i++) {
                var thisRegion = regions[i];
                var states = thisRegion["states"];
                var thisRegionName = thisRegion["name"];
                if (region === thisRegionName) {
                    for (var k = 0; k < states.length; k++) {
                        var state = states[k];
                        var totalStates = states.each;
                        if (state >= states[k + 1]) {
                            $("#statesInRegion").append('<span class="stateOfRegion">' + state["display-name"] + ', </span>');
                        } else if (state) {
                            $("#statesInRegion").append('<span class="stateOfRegion"> and ' + state["display-name"] + '.</span>');
                        }
                    }
                }
            }

            // Build the Cost vs Value Data Table
            var tableRows = [];
            for (var i = 0; i < regionData.length; i++) {
                var project = regionData[i];
                var projectRow = {
                    "display-name": project["display-name"],
                    "regional-job-cost": CvV.filterNumber(project["job-cost"]),
                    "regional-value-at-sale": CvV.filterNumber(project["value-at-sale"]),
                    "regional-cost-recouped": CvV.filterPercentage(project["cost-recouped"]),
                    "change-vs-2015": project["change-vs-2015"],
                    "name": project["name"],
                    "value": project["name"]
                };
                tableRows.push(projectRow);
            }
            for (var i = 0; i < nationalAverage.length; i++) {
                var nationalProject = nationalAverage[i];
                var nationalProjectName = nationalProject["name"];
                var nationalProjectRow = {
                    "national-job-cost": CvV.filterNumber(nationalProject["job-cost"]),
                    "national-value-at-sale": CvV.filterNumber(nationalProject["value-at-sale"]),
                    "national-cost-recouped": CvV.filterPercentage(nationalProject["cost-recouped"]),
                };

                // merge National Average with Region data
                for (var k = 0; k < tableRows.length; k++) {
                    var tableRow = tableRows[k];
                    if (tableRow["name"] === nationalProjectName) {
                        $.extend(tableRow, nationalProjectRow);
                    }
                }
            }

            // data table to be displayed when User enter a valid query
            $(".regionTable").fadeIn(3000).promise().then(function() {
                $(this).footable({
                    "columns": [{
                        "name": "display-name",
                        "title": "Project",
                        "style": {
                            "color": "#00aced"
                        }
                    }, {
                        "name": "national-job-cost",
                        "title": "Job Cost",
                        "style": {
                            "background-color": "#f1f1f1"
                        }
                    }, {
                        "name": "national-value-at-sale",
                        "title": "Resale Value",
                        "style": {
                            "background-color": "#f1f1f1"
                        }
                    }, {
                        "name": "national-cost-recouped",
                        "title": "Cost Recouped",
                        "breakpoints": "xs",
                        "style": {
                            "background-color": "#f1f1f1"
                        }
                    }, {
                        "name": "regional-job-cost",
                        "title": "Job Cost",
                        "style": {
                            "background-color": "#ccecfb"
                        }
                    }, {
                        "name": "regional-value-at-sale",
                        "title": "Resale Value",
                        "style": {
                            "background-color": "#ccecfb"
                        }
                    }, {
                        "name": "regional-cost-recouped",
                        "title": "Cost Recouped",
                        "breakpoints": "xs",
                        "style": {
                            "background-color": "#ccecfb"
                        }
                    }, {
                        "name": "change-vs-2015",
                        "title": "Change vs 2015",
                        "breakpoints": "xs",
                    }],
                    "rows": tableRows
                });
                $(".regionTable td:first-child").addClass("projectName");
                for (var i = 0; i < projectPageUrlList.length; i++) {
                    var projectUrl = projectPageUrlList[i];
                    $(".projectName").each(function() {
                        if ($(this).text() === projectUrl["display-name"]) {
                            $(this).contents().filter(function() {
                                return this.nodeType == 3;
                            }).wrap('<a href="' + projectUrl["project-url"] + '"></a>');
                        }
                    });
                }
                $(".projectName a").css({
                    "color": "#00aced",
                    "text-decoration": "none",
                    "font-family": "'Polaris Condensed', sans-serif"
                });
                $(".projectName a").mouseover(function() {
                    $(this).css("color", "#000");
                })
                    .mouseleave(function() {
                        $(this).css("color", "#00aced");
                    });
                    // adds proper grammatical semantics to numerals and percentage values as they are not present in the data file
                $(".regionTable td:nth-child(2)").addClass("convertValue");
                $(".regionTable td:nth-child(3)").addClass("convertValue");
                $(".regionTable td:nth-child(4)").addClass("convertPercentage");
                $(".regionTable td:nth-child(5)").addClass("convertValue");
                $(".regionTable td:nth-child(6)").addClass("convertValue");
                $(".regionTable td:nth-child(7)").addClass("convertPercentage");
                $(".regionTable td:nth-child(8)").addClass("changeVs2015");

                $(".convertValue").each(function() {
                    var cost = $(this).text().replace(/\B(?=(?:\d{3})+(?!\d))/g, ',');
                    var costToString = CvV.formatDollars(cost);
                    $(this).html(costToString);
                });
                $(".convertPercentage").each(function() {
                    var costPercentage = $(this).text();
                    $(this).html(costPercentage + "%");
                });
                $(".changeVs2015").each(function() {
                    if ($(this).text() === "increase") {
                        $(this).text("");
                        $(this).append("<span class='fa fa-arrow-up' style='color:#00aced'></span>")
                    } else if ($(this).text() === "decrease") {
                        $(this).text("");
                        $(this).append("<span class='fa fa-arrow-down' style='color:#00aced'></span>");
                    } else {
                        $(this).text("–");
                    }
                });

                // sets width of top table to align with bottom table
                var tdProjectWidth2 = $(".regionTable td:first-child").innerWidth();
                var regionCol2Width = $(".regionTable td:nth-child(2)").innerWidth();
                var regionCol3Width = $(".regionTable td:nth-child(3)").innerWidth();
                var regionCol4Width = $(".regionTable td:nth-child(4)").innerWidth();
                var regionCol5Width = $(".regionTable td:nth-child(5)").innerWidth();
                var regionCol6Width = $(".regionTable td:nth-child(6)").innerWidth();
                var regionCol7Width = $(".regionTable td:nth-child(7)").innerWidth();


                var tdNationalAveragesWidth2 = (regionCol2Width + regionCol3Width + regionCol4Width);
                var tdRegionalAveragesWidth = (regionCol5Width + regionCol6Width + regionCol7Width);

                $("#spacingTd2").innerWidth(tdProjectWidth2);
                $("#tableHeaderNationalBanner2").innerWidth(tdNationalAveragesWidth2);
                $("#tableHeaderRegionalBanner").innerWidth(tdRegionalAveragesWidth);


            });


            // Builds regionBreakdown and paragraph headers
            $("#tableHeaderRegionalBanner").append('<span id="regionalTableLegend2"></span>' + regionName);
            $("#location").append('Get more from the ' + regionName + " Region.");
            $("#regionIdentity").append('The ' + regionName + ' region covers');
            $("#citySpecificLeadingText").append(" Download in-depth data -- including job costs, resale value, and cost recouped -- for these cities:");
            $("#regionTrendHeader").append(regionName + " Trend Analysis");
            $("#regionTrendText").append("As the new-home market makes strides, so too does the remodeling industry. This year’s Cost vs. Value Report shows the second-highest return at resale in the past 8 years, with higher payback from bigger projects and valuable exterior and energy efficient improvements  contributing to the climb. " + "<a href='http://www.remodeling.hw.net/cost-vs-value/the-2016-cost-vs-value-report'>" + "Read more" + "</a>");
            $("#costVsValueData").append("National & " + regionName + " Data for All Projects");
        }
    };

    // build the default national average table
    var nationalAverage = CvV.getRegionData("national");
    var defaultTableRows = [];
    var projectPageUrlList = [];
    for (var i = 0; i < nationalAverage.length; i++) {
        var nationalProject = nationalAverage[i];
        var nationalProjectName = nationalProject["name"];

        var nationalProjectRow = {
            "display-name": nationalProject["display-name"],
            "national-job-cost": CvV.filterNumber(nationalProject["job-cost"]),
            "national-value-at-sale": CvV.filterNumber(nationalProject["value-at-sale"]),
            "national-cost-recouped": CvV.filterPercentage(nationalProject["cost-recouped"]),
            "national-change-vs-2015": nationalProject["change-vs-2015"]
        };
        var projectPageUrl = CvV.getProjectPageUrl(nationalProject["name"]);
        var projectPageUrls = {
            "display-name": nationalProject["display-name"],
            "project-url": projectPageUrl
        };
        projectPageUrlList.push(projectPageUrls);
        defaultTableRows.push(nationalProjectRow);
    }


    $('.defaultTable').footable({
        "columns": [{
            "name": "display-name",
            "title": "Project",
            "style": {
                "color": "#00aced"
            }
        }, {
            "name": "national-job-cost",
            "title": "Job Cost",
            "style": {
                "background-color": "#f1f1f1"
            }
        }, {
            "name": "national-value-at-sale",
            "title": "Resale Value",
            "breakpoints": "xs",
            "style": {
                "background-color": "#f1f1f1"
            }
        }, {
            "name": "national-cost-recouped",
            "title": "Cost Recouped",
            "style": {
                "background-color": "#f1f1f1"
            }
        }, {
            "name": "national-change-vs-2015",
            "title": "Change vs 2015",
            "breakpoints": "xs",
        }],
        "rows": defaultTableRows
    });
    $(".defaultTable td:first-child").addClass("projectName");
    for (var i = 0; i < projectPageUrlList.length; i++) {
        var projectUrl = projectPageUrlList[i];
        $(".projectName").each(function() {
            if ($(this).text() === projectUrl["display-name"]) {
                $(this).contents().filter(function() {
                    return this.nodeType == 3;
                }).wrap('<a href="' + projectUrl["project-url"] + '"></a>');
            }
        });
    }
    $(".projectName a").css({
        "color": "#00aced",
        "text-decoration": "none",
        "font-family": "'Polaris Condensed', sans-serif"
    });
    $(".projectName a").mouseover(function() {
        $(this).css("color", "#000");
    })
        .mouseleave(function() {
            $(this).css("color", "#00aced");
        });

    // sets width of top table to match bottom
    $(".defaultTable td:nth-child(2)").addClass("convertValue");
    $(".defaultTable td:nth-child(3)").addClass("convertValue");
    $(".defaultTable td:nth-child(4)").addClass("convertPercentage");
    $(".defaultTable td:nth-child(5)").addClass("changeVs2015");
    $(".convertValue").each(function() {
        var cost = $(this).text().replace(/\B(?=(?:\d{3})+(?!\d))/g, ',');
        var costToString = CvV.formatDollars(cost);
        $(this).html(costToString);
    });
    $(".convertPercentage").each(function() {
        var costPercentage = $(this).text();
        $(this).html(costPercentage + "%");
    });
    $(".changeVs2015").each(function() {
        if ($(this).text() === "increase") {
            $(this).text("");
            $(this).append("<span class='fa fa-arrow-up' style='color:#00aced'></span>")
        } else if ($(this).text() === "decrease") {
            $(this).text("");
            $(this).append("<span class='fa fa-arrow-down' style='color:#00aced'></span>");
        } else {
            $(this).text("–");
        }
    });

    // sets data table column width
    var tdProjectWidth1 = $(".defaultTable td:first-child").innerWidth();
    var defaultCol2Width = $(".defaultTable td:nth-child(2)").innerWidth();
    var defaultCol3Width = $(".defaultTable td:nth-child(3)").innerWidth();
    var defaultCol4Width = $(".defaultTable td:nth-child(4)").innerWidth();

    var tdNationalAveragesWidth1 = (defaultCol2Width + defaultCol3Width + defaultCol4Width);

    $("#spacingTd1").innerWidth(tdProjectWidth1);
    $("#tableHeaderNationalBanner1").innerWidth(tdNationalAveragesWidth1);

}, 2000);
