
Promise.all([d3.json('./json_data/Zhang_relation.json'),d3.json('./json_data/Zhang_event.json')]).then(data=>{

    // const { color } = require("d3");

    // 设置基础变量
    var width = 350;
    var height = 250;
    let simulation;
    let lines, nodes, circles;
    var timelinks, timenodes
    let inn = 0
    let widths = window.screen.availWidth


    let layout = ({
        width: 400,
        height: 300,
        margin: {
            top: 130,
            bottom: 135,
            left: 40,
            right: 40
        }
    })

    console.log(data)
    let data_links = data[0].links
    let data_nodes = data[0].nodes
    let event_data = data[1].events

    // 定义画布
    let svg = d3.select('#force')
            .append('svg')
            // .attr('class', 'svg')
            .attr('width', width)
            .attr('height', height)
            .attr('class', 'happy')

    // 定义力导向图simulation
    simulation = d3.forceSimulation()
        // .force('link', d3.force Link().id(function(d, i) {return i }.strength(0.05).distance(200)))
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter(width / 2, height / 2))
        // .force('manyBody', d3.forceManyBody().strength(-40))
        // .force("forceX", d3.forceX().strength(.005))
        // .force("forceY", d3.forceY().strength(.005))

    const drag = d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

    timelinks = data_links
    timenodes = data_nodes

    init_table();
    scrollHandle();

    slider_snap(1957, 2021)

    // 生成连线与节点
    lines = svg.selectAll('line').data(timelinks)
        .enter().append('line')
        .attr('class', 'line')
        .attr('stroke', 'black')
        .attr('opacity', 0.5)
        .attr('stroke-width', .5);

    let linkText = lines.selectAll('text').attr('class', 'link-text')
        .data(timelinks)
        .enter().append('text')
        .attr('y', -20)
        .attr('dy', '.71em')
        .attr('fill','#2E8B57')
        .style('fill-opacity',1)
        .text(function(d){return d.relation});

    nodes = svg
        .selectAll('g')
        .data(timenodes)
        .enter().append('g')
        .attr('class', 'nodes')
        .on('mouseover', function(d, i) {
            //显示连接线上的文字
            linkText.style('fill-opacity', function(links) {
                if (links.source === d || links.target === d) {
                    return 1;
                }
                    else return 0;
            })
            //连接线加粗
            lines.style('stroke-width', function(links) {
                if (links.source === d || links.target === d) {
                    return '4px'
                }
            })
                .style('stroke', function(links) {
                if (links.source === d || links.target === d) {
                    return '#000'
                }
            });
        })

        .on('mouseout', function(d, i) {
            //隐去连接线上的文字
            linkText.style('fill-opacity', function(links) {
                return 0; 
            })
            //连接线减粗
            lines.style('stroke-width', function(links) {
                if (links.source === d || links.target === d) {
                    return '2px'}})
                .style('stroke', function(links) {
                if (links.source === d || links.target === d) {
                    return 'black'}
                })
                .style('opacity', 0.5)
                .style('stroke-width', .5)
            })
        // 此处调用drag函数，证明drag的是具体的点
        .on("click", function (event, d) {
            if (event.ctrlKey) {
            //  location.href = 'http://www.google.com';
            var name = d.name;
            var p = name.replace(/[\\s]/g, "_")
            window.open('https://en.wikipedia.org/wiki/'+p)
            }
        })
        .call(drag)
        

    circles = nodes.append('circle')
        .attr('r', function(d) {
            if(d.name=="Zhang Guimei")  {
            return 20;}
            else{
            return 10;}     
        })
        .attr('fill',"#C1CDC1")

    let cText = nodes.append('text')
        .attr('fill',"#98968E")
        // .style('opacity', 0.3)
        .attr('y', -20)
        .attr('dy', '.57em')
        .text(function(d) {
            return d.name
        })
        .style("font-size","10px")

    simulation // 初始化力导向图
        .nodes(timenodes)
        .on('tick', ticked)
    simulation.force('link',d3.forceLink(timelinks).strength(0.05).distance(50))
        .force('manyBody', d3.forceManyBody().strength(-40))




    function slider_snap(min, max, starting_min=min, starting_max=max) {

        var beginning, ending
        var range = [min, max + 1]
        var starting_range = [starting_min, starting_max + 1]
    
        // set width and height of svg
        var w = layout.width
        var h = layout.height
        var margin = layout.margin
    
        // dimensions of slider bar
        var width = w - margin.left - margin.right;
        var height = h - margin.top - margin.bottom;
    
        // create x scale
        var x = d3.scaleLinear()
            .domain(range)  // data space
            .range([0, width-10]);  // display space
        
        // create svg and translated g
        var svg_brush = d3.select('#brush')
            .append('svg')
            .attr('width', widths)
            .attr('height', h)
            .attr('class', 'brush')
        
        const g = svg_brush.append('g')
           // .attr('transform', `translate(${margin.left}, ${margin.top})`)
           .attr('transform', `translate(10, 10)`)
    
        // draw background lines
        g.append('g')
            // .attr('style', 'background-color:green')
            .selectAll('line')
            .data(d3.range(range[0], range[1]+1))
            .enter()
            .append('line')
            .attr('x1', d => x(d)).attr('x2', d => x(d))
            .attr('y1', 0).attr('y2', height)
            .style('stroke', '#ccc')
        
        // labels
        var labelL = g.append('text')
            .attr('id', 'labelleft')
            .attr('x', 0)
            .attr('y', height + 5)
            .text(range[0])
    
        var labelR = g.append('text')
            .attr('id', 'labelright')
            .attr('x', 0)
            .attr('y', height + 5)
            .text(range[1])
    
        // define brush
        var brush = d3.brushX()
        .extent([[0,0], [width-10, height]])
        .on('brush', function(event) {
            var s = event.selection;
            // update and move labels
            labelL.attr('x', s[0])
                .text(Math.round(x.invert(s[0])))
            // 根据刷选范围的横坐标，通过比例尺的invert返回相应的值
            beginning = Math.round(x.invert(s[0]))
            labelR.attr('x', s[1])
                .text(Math.round(x.invert(s[1])) - 1)
            ending = Math.round(x.invert(s[1])) - 1
            // move brush handles      
            handle.attr("display", null).attr("transform", function(d, i) { return "translate(" + [ s[i], - height / 4] + ")"; });
            // update view
            // if the view should only be updated after brushing is over, 
            // move these two lines into the on('end') part below
            svg_brush.node().value = s.map(d => Math.round(x.invert(d)));
            svg_brush.node().dispatchEvent(new CustomEvent("input"));

            update_force(beginning, ending)
            update_table(beginning, ending)
            // updata_tree(beginning, ending)
        })
        .on('end', function(event) {
            if (!event.sourceEvent) return;
            var s = event.selection;
            var d0 = event.selection.map(x.invert);
            var d1 = d0.map(Math.round)
            d3.select(this).transition().call(event.target.move, d1.map(x))

            beginning = Math.round(x.invert(s[0]))
            ending = Math.round(x.invert(s[1])) - 1
            updata_tree(beginning, ending)

        })
    
        // append brush to g
        var gBrush = g.append("g")
            .attr("class", "brush")
            .call(brush)
    
        // add brush handles (from https://bl.ocks.org/Fil/2d43867ba1f36a05459c7113c7f6f98a)
        // 添加刷选器旁边的把儿
        var brushResizePath = function(d) {
            var e = +(d.type == "e"),
                x = e ? 1 : -1,
                y = height / 2;
            return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) +
            "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) +
            "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
        }
    
        var handle = gBrush.selectAll(".handle--custom")
            .data([{type: "w"}, {type: "e"}])
            .enter().append("path")
            .attr("class", "handle--custom")
            .attr("stroke", "#000")
            .attr("fill", '#eee')
            .attr("cursor", "ew-resize")
            .attr("d", brushResizePath);
            
        // override default behaviour - clicking outside of the selected area 
        // will select a small piece there rather than deselecting everything
        // https://bl.ocks.org/mbostock/6498000
        gBrush.selectAll(".overlay")
            .each(function(d) { d.type = "selection"; })
            .on("mousedown touchstart", brushcentered)
        
        function brushcentered() {
            var dx = x(1) - x(0), // Use a fixed width when recentering.
            cx = d3.mouse(this)[0],
            x0 = cx - dx / 2,
            x1 = cx + dx / 2;
            d3.select(this.parentNode).call(brush.move, x1 > width ? [width - dx, width] : x0 < 0 ? [0, dx] : [x0, x1]);
        }
        
        // select entire starting range as the instial
        gBrush.call(brush.move, starting_range.map(x))
    

    }

    function update_force(beginning, ending){
        timelinks = [];
        timenodes = [];

        if(inn == 0){
            // init_nodelink();
            timenodes = data_nodes;
            timelinks = data_links;
            inn += 1;
        }
        else{
            time_update(beginning, ending)

            simulation.nodes(timenodes).force("collide", d3.forceCollide()
                .strength(1)
                .iterations(5))
            simulation.force("link").links(timelinks);
            simulation.alpha(0.1).restart();

            // three steps: remove/update/add
            nodes = svg.selectAll('.nodes').data(timenodes)
            lines = svg.selectAll('.line').data(timelinks)
            const t = d3.transition().duration(750);

            // remove
            let lineExit = lines.exit()
            lineExit.transition(t).remove()

            lineExit.selectAll('line')
                // .attr('stroke', "#b26745")
                .transition(t)

            let nodeExit = nodes.exit()
            nodeExit.transition(t).remove()

            nodeExit.selectAll('circle')
                // .attr("fill", "#b26745")
                .transition(t)
                .attr("r", 1e-6)
            nodeExit.selectAll("text")
                .attr("fill", "blue")
                .transition(t)
                .attr("font-size", 1);
        
            // update
            // nodes.selectAll('circle').data(timenodes).transition(t).attr('fill', 奇怪颜色)
            lines.transition(t).attr('stroke', 'black')
            nodes.selectAll('circle').data(timenodes).transition(t)
            nodes.selectAll('text').data(timenodes).transition(t).style("font-size","10px")

            // enter 
            lines.enter().append('line')          
                .attr('class', 'line')
                .attr('stroke', 'black')
                .attr('opacity', 0.5)
                .attr('stroke-width', .5);
            let nodeEnter = nodes.enter().append("g").attr("class", "nodes").call(drag)

            nodeEnter.append("circle").attr("fill", "#C1CDC1").attr("r", 10).transition(t)
            let text = nodeEnter.append("text").transition(t)
                .attr('fill',"#98968E")
                .attr('y', -20)
                .attr('dy', '.71em')
                .text(d => {return d.name})
                // text.style('opacity', 0.3)
        }
    }

    function time_update(beginning, ending){
        let allindex = []
        timenodes = []
        timelinks = []
        data_links.forEach(data =>{
        if(data.time >= beginning && data.time <= ending){
            timelinks.push(data)
            allindex.push(data.source.name)
            allindex.push(data.target.name)
            }
        })
        data_nodes.forEach((data, i)=>{
        if (allindex.indexOf(data.name) != -1){
        // if(allindex.indexOf(i) != -1){
            timenodes.push(data)
        }
        })
    }  


    // 定义拖拽
    // 疑问：fx和fy怎么解释
    function dragstarted(event, d){
        if(!event.active){
            simulation.alphaTarget(0.3).restart()
        }
        d.fx = d.x
        d.fy = d.y
    }
    function dragged(event, d) {
        d.fx = event.x
        d.fy = event.y
    }
    function dragended(event, d) {
        if (!event.active) {
            simulation.alphaTarget(0)
        }
        simulation.restart()
        d.fx = null
        d.fy = null
    }

    // 定义ticks
    function ticked() {
        lines
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
            // circles
            // .attr('cx', d => d.x)
            // .attr('cy', d => d.y) 

        nodes.attr('transform', function(d) {
            return 'translate(' + d.x + ',' + d.y + ')'
        });

        nodes.attr("cx", function(d) {
            return d.x = Math.max(20, Math.min(width - 20, d.x));
        })
        .attr("cy", function(d) {
            return d.y = Math.max(20, Math.min(height - 20, d.y));
        });
    }
    
    function scrollHandle() {//表格滚动处理
        var paddingRightFix = 0; //表头右侧padding
        var visibleHeight = 250; //表格内容可见高度
        var contentHeight = $('.table-body tr').length * ($('.table-head').height() - 1);
        if(contentHeight > visibleHeight) { //表格内容超出可见高度则滚动
            paddingRightFix = 17; //padding值等于滚动条宽度
        } else {
            paddingRightFix = 0;
        }
        $('.table-head').css('padding-right', paddingRightFix);
    };
    
    function init_table(){
        // 首先把data_links所有的事件按照时间发生顺序排列
        event_data.sort(function(a,b){
        if(+a.date < +b.date){
            return -1;
        }
        else if(+a.date > +b.date){
            return 1;
        }
        return 0;
        })

        var min_year = event_data[0].date;
        var max_year = event_data[event_data.length-1].date

        var link_length = event_data.length;
        var visibleHeight = 270; //表格内容可见高度
        for(var i=0; i<link_length; i++){
            var rowdata = event_data[i];
            var adddata = '<tr><td>'+rowdata['date']+'</td><td>'+rowdata['dimension']+'</td><td>'+rowdata['origin']+'</td></tr>';
            $('.table-body table').append(adddata);
        }
        init_color(min_year, max_year)
        scrollHandle(); 
        $('.table-body').css('height', visibleHeight);

    }

    function init_color(min, max){
        var myTab = document.getElementsByClassName('table-body')[0].firstElementChild
        let linear = d3.scaleLinear().domain([min, max]).range([0, 1])
        let compute = d3.interpolateRgb("#C0D1D1", "#3F7273")

        let geography_color = "#9D7F9F"
        let career_color = "#5C896F" 
        let relation_color = "#B89C82"
        let temporal_color = "#54777A"

        for(var i=0; i<myTab.rows.length; i++){
            var objCells = myTab.rows.item(i);
            // var text = +objCells.cells[0].innerHTML;
            // var tr_color = compute(linear(text));
            if (event_data[i].type == 'relation'){
                objCells.style.backgroundColor = relation_color
            } else if(event_data[i].type == 'geography'){
                objCells.style.backgroundColor = geography_color
            } else if(event_data[i].type == 'career'){
                objCells.style.backgroundColor = career_color
            } else if(event_data[i].type == 'temporal'){
                objCells.style.backgroundColor = temporal_color
            }

            objCells.style.opacity = "0.5"
            // if(text >= beginning && text<= ending){
            //     myTab.rows.item(i).style.display = "";
            // }else{
            //     myTab.rows.item(i).style.display = "none";
            // }
        }
    }

    function update_table(beginning, ending){
        var myTab = document.getElementsByClassName('table-body')[0].firstElementChild
        for(var i=0; i<myTab.rows.length; i++){
            var objCells = myTab.rows.item(i).cells;
            var text = +objCells[0].innerHTML;
            if(text >= beginning && text<= ending){
                myTab.rows.item(i).style.display = "";
            }else{
                myTab.rows.item(i).style.display = "none";
            }
        }
        scrollHandle();
    }

    function updata_tree(beginning, ending){
        d3.select('body').select('#life').select('.canva').remove();
        d3.selectAll('.annotion_container').remove();
        // let get = $("#person_name").find("option:selected").text();
        new LifeCircle("Zhang Guimei", beginning, ending)
    }

})

// --------------------------------------------------------------------------

/*
    output:规则的数据
*/
async function get_data(get_name, beginning, ending) {

    let data_name = "./data/data(" + get_name + ").txt"
    let description_name = "./data/brief(" + get_name + ").txt"
    let jpg_name = "./img/" + get_name + ".jpg"
    let data = await d3.text(data_name)
    let description = await d3.text(description_name)

    // let data = await d3.text('./data/data(Zhang Guimei).txt')
    // let description = await d3.text('./data/brief(Zhang Guimei).txt')

    // 替换左下角简介板的信息
    let name = description.split(',')[0].replace('name:', "")
    d3.select('.brief-demo').text(description.replace(`name:${name}, introduction:`, ""))
    d3.select('.brief-title').text(name)
    d3.select('.rect-inner img').attr('src', jpg_name)
    // d3.select('.rect-inner img').attr('src', './img/Zhang Guimei.jpg')
    //'./img/Evelyn Waugh.jpeg''./img/' + name + '.jpg'
    

    let split_data = data.split('\r\n')
    let _data = split_data.map(d => {

        let date = d.split(',')[5]?.trim().replace('date:', "") ?? ""
        date = Array.from(date.matchAll(/\d{4}/g))
        return {
            content: d.match(/.*(?=dimension:)/)?.[0],
            date: date?.[0]?.[0],
            origin: d.match(/(origin)\:.*/)?.[0].replace('origin:', ""),
            dimension: d.match(/(dimension)\:.*?(?=,)/)?.[0].replace('dimension:', ""),
            type: d.match(/(type)\:.*?(?=,)/)?.[0].replace('type:', ""),
        }
    })
    _data = _data.filter(d => d.date)
    _data.sort((a, b) => +a.date > +b.date ? -1 : 1)
    let filter_data = _data.filter(d => {
        return +d.date <=ending && +d.date >= beginning
    })
    return filter_data
}

// 定义:树干>树枝>树杈
class Tree {
    // this.g : svg of the  
    // 
    constructor(id, svg, pos, data, degree) {
        this.id = id
        this.parent_svg = svg   // 得知父节点从而在父节点基础上拓展
        this.pos = pos
        this.data = data    // 已经处理过的数据data
        this.degree = degree
        this.init()
    }
    
    // 初始化画布，
    init() {
        // 首先把画布上的g组件定义好
        this.init_svg()
        // 把四类叶子的svg定义好了，也把branch的svg定义好了
        this.init_image_for_use_to_href()
        this.draw_branch()
    }

    init_svg() {
        this.g = this.parent_svg.append('g')
    }

    init_image_for_use_to_href() {
        // 首先创建一个defs元素，defs中的图形svg可以被重复使用
        let defs = this.g.append('defs')
        let w = 4
        let h = 4
        this.image_w = w
        this.image_h = h
        // scale不知道有什么用???
        this.scale = 1
        // defs元素必须定义id，之后引用将使用#id来进行
        // 例: <use xlink::href="#img_branch" x="50" y="50"/> 
        defs.append('image').attr('href', './img/branch.svg').attr('id', "img_branch")

        let draw_image = (path, id) => {
            defs.append('image')
                .attr('href', path)
                .attr('id', id)
                .attr('width', w)
                .attr('height', h)
        }

        draw_image('./img/upper-right-legend/geographic event-open.svg', 'geography')
        draw_image('./img/upper-right-legend/relationship event-open.svg', 'relation')
        draw_image('./img/upper-right-legend/temporal event-open.svg', 'temporal')
        draw_image('./img/upper-right-legend/career event-open.svg', 'career')
    }

    draw_branch() {
        // 根据id来进行判断该枝丫是往上还是往下
        this.is_up = this.id % 2 === 0
        this.data_types = d3.groups(this.data, d => d.type)

        // trunk是多个类型的情况.需要判断是否有多个类型
        // 如果是多个年份，trunk_g会有定义，下方if_trunk_then函数会用到
        this.add_trunk_while_multi_types()

        // 增加year的文字
        this.add_year_text()

        this.data_types.forEach((d, i) => {

            this.if_trunk_then_add_and_rotate_trunk()
            // 根据叶子的情况，得到了角度
            let { pos, direction, trunk_degree } = this.get_position_direction_from_trunk(d)

            this.add_leaves({
                data: d[1],
                img_id: d[0],
                g: this.leaves_g,
                position: pos ? pos : { x: 0, y: 0 },
                direction: direction,
                trunk_degree

            })


        })
    }
    // 根据角度画 🍃 部分
    add_leaves(params) {
        let { data } = params
        params.total = data.length

        this.get_rotate_value(params)
        // 设置叶子所在的位置
        this.append_leavesUse_and_spirePath_container(params)
        const append_use = this.get_imge_use_func(params)
        // 添加每个小枝叶的枝
        const append_spire = this.get_spire_func(params)
        const append_annotation = this.get_annotion_func(params)
        data.forEach((d, i) => {
            // 添加枝条和树叶
            this.spire_path = append_spire(d, i)
            this.spire_image_use = append_use(d, i)
            // 添加dimension的anotation框
            // 重要事件以annotation形式呈现
            append_annotation(d, i)
        })
        
    }

    if_trunk_then_add_and_rotate_trunk() {
        // 如果多个类别，trunk_g会在之前被定义，从而判断
        this.leaves_g = this.trunk_g ? this.trunk_g : this.g.append('g').attr('class', 'onlyleaves')
        // 同时为往上的枝丫且多类叶子
        this.leaves_g.attr('transform', `rotate(${(this.is_up && this.trunk_g) ? 180 : 0})`)
        // 在trunk_g有定义的前提下，调整叶子的角度???
        this.trunk_g && this.leaves_g.attr('transform', `rotate(${this.is_up ? 180 : this.degree})`)
    }

    get_position_direction_from_trunk(d) {
        let pos, direction, trunk_degree = 0
        // 如果有trunk_path，即多类叶子存在的情况
        if (this.trunk_path) {
            // path.node().getTotalLength()为一个函数，返回路径总长度
            let path_length = this.trunk_path.node().getTotalLength()
            // getPointAtLength返回路径上指定距离的坐标！
            // 利用pos和pos1取了个指定位置的梯度
            pos = this.trunk_path.node().getPointAtLength(path_length * this.types_position[d[0]])
            let pos1 = this.trunk_path.node().getPointAtLength(path_length * this.types_position[d[0]] * 0.98)
            trunk_degree = Math.atan((pos.y - pos1.y) / (pos.x - pos1.x)) / Math.PI * 180
            // 这里调整方向
            direction = this.types_direction[d[0]]
        }
        return { pos, direction, trunk_degree }
    }
    
    // 当多类 return_values的值?
    add_trunk_while_multi_types() {
        this.trunk_g = undefined
        this.trunk_path = undefined
        if (this.data_types.length > 1) {
            // 如果不少于两个类别，就多加了一条线
            let return_values = this.add_trunk() // 设置trunk_g和trunk_path
            this.trunk_g = return_values.trunk_g
            // 返回一条三次贝塞尔曲线
            this.trunk_path = return_values.trunk_path
        }

        // 定义四种类型事件叶子的位置和方向
        this.types_position = {
            geography: 0.3, relation: 1, temporal: 0.1, career: 0.7
        }
        this.types_direction = {
            geography: "left", relation: "right", temporal: "center", career: "top"
        }
    }

    add_trunk() {
        let trunk_g = this.g.append('g')
            .attr('class', 'trunk2')

        // 树干
        let trunk_path = trunk_g.append('path')
            // .attr('d', `M0,0 c 0,5 -2,5 0,8`)
            // 画笔moveto(M X,Y) 
            // 三次贝赛尔曲线curveto(C X1,Y1 X2,Y2 ENDX,ENDY)
            .attr('d', `M0,0  c 0,5 -2,5 0,12`)
            .attr('stroke', "#5b584a")
            // 三次贝塞尔曲线如果不fill none的话，会在圈选区域涂黑
            .attr('fill', "none")
            .attr('stroke-width', 0.1)

        return { trunk_g, trunk_path }
    }

    add_year_text() {
        // 加年份
        this.g.append('text')
            // 如果枝丫在上侧，就把年份写在上端-15处
            .attr('transform', `translate(${this.is_up ? "0,-15" : "0,15"})`)
            .text(this.data[0].date)
            .attr('font-size', '0.1rem')
            .attr('fill', 'gray')
    }

    append_leavesUse_and_spirePath_container(params) {
        let { g, position, direction } = params
        // matrix(-1 0 0 1 0 0)意思未知，但总体知道是在扩展叶子位置
        this.leaves_of_types_g = g.append('g').attr('class', 'leaves_1')
            .attr('transform', `translate(${position.x},${position.y}) 
        rotate( ${this.is_up ? 180 : 0}  )
       ${(direction === "left") ? "matrix(-1 0 0 1 0 0)" : ""}  
         `)
    }

    get_spire_func(params) {
        let { img_id, data, g, position, direction, trunk_degree } = params
        return (d, i) => {
            let adjuest_degree = ((i % 2 === 0 ? 1 : -1) * i * 30)
            let spire_degree = 90 - this.degree - adjuest_degree

            let x = Math.abs(Math.sin(spire_degree) * 5)
            let y = (trunk_degree ? (this.is_up ? -1 : 1) : 1) * Math.abs(Math.cos(spire_degree) * 5)
            y = Math.abs(y) < 1.5 ? 4 : y
            // x = Math.abs(x) >4 ? 2 : x
            return this.leaves_of_types_g.append('path')
                // 二次贝塞尔曲线 (Q X,Y ENDX,ENDY)
                .attr('d', `M 0,0 q  ${x / 4},${y / 4} ${x * 0.4},  ${y * 1.2}`)
                .attr('stroke', 'url(#Gradient1)')
                .attr('stroke-width', 0.4)
                .attr('fill', 'none')
                .attr('opacity', 1)
        }
    }


    get_imge_use_func(params) {
        let { img_id, trunk_degree } = params
        return (d, i) => {
            // 得到整个小枝丫的长度，并把位置定位在小枝丫的末梢
            let total = this.spire_path.node().getTotalLength()
            let pos = this.spire_path.node().getPointAtLength(total)

            // 将四种花朵的图标插入
            let uses = this.leaves_of_types_g.append('g')
                .attr('transform', `translate(${pos.x - 2}, ${pos.y - 2}) scale(1)`)
                .append('use')
                // 和init_image对上了，SVG<use>元素可以在SVG图像中多次重用一个预定义的SVG图形
                .attr('xlink:href', `#${img_id}`)
                .attr('class', 'myimg')

            uses.on('mouseover', (e) => {
                this.tips_show(e, d)
            })
            uses.on('mouseleave', () => {
                this.tips_hide()
            })
            return uses
        }

    }

    get_annotion_func(params) {
        let { img_id, data, g, position, direction, trunk_degree } = params

        return (d, i) => {
            if (d.dimension !== "Highlight") return
            let pos = this.spire_path.node().getPointAtLength(this.spire_path.node().getTotalLength())

            let classname = d.content.slice(-15).replace(/\W/g, '')

            let path = this.leaves_of_types_g.append('path')
                .attr('d', `M ${pos.x},${pos.y} q 2,0  
                 ${Math.abs(Math.sin(90 - this.degree + (i * 90)) * 105)},  
                ${(trunk_degree ? (this.is_up ? -1 : 1) : 1) *
                    Math.abs(Math.cos(90 - this.degree + (i * 90)) * 55)} `)
                // .attr('stroke', 'url(#Gradient1)')
                // .attr('stroke', 'gray')
                // .attr('stroke-width', 0.1)
                .attr('stroke-dasharray', '1 1')
                .attr('fill', 'none')
                .attr('opacity', 1)
                .attr('class', `annotion_path annotion_path${classname}`)
                .attr('title', d.date + '/' + d.content + '/'
                    + d.type + '/' + d.origin +
                    '/' + `annotion_path${classname}` + '/' + d.dimension)

        }
    }

    tips_show(e, d, img_g) {

        let types = {
            geography: "pink", relation: "yellow", temporal: "gray", career: "green"
        }

        d3.select(".d3-tip")
            .style("display", "block")
            .style("position", "absolute")
            .style("top", `${e.pageY + 10}px`)
            .style("left", `${e.pageX + 10}px`)
            .html(
                () => ` <div>
                <div>
                    <img src="./img/tooltip_${types[d.type]}.svg" class="tooltip-icon" style="vertical-align:middle">
                </div>
                <div class="tooltip-paragraph">
                    <div class="tooltip-title">${d?.date}, ${d?.type} Event</div>
                    <div  class="tooltip-text">
                    ${d?.origin}
                    </div>
                </div>
            </div>
`
            );


        // d3.select('use').attr('opacity', 1)
        // img_g.selectAll('use').attr('class', "i")
    }
    tips_hide() {
        d3.select(".d3-tip").style("display", "none");

    }
    get_rotate_value(params) {
        let { direction, trunk_degree, total } = params
        // 定义旋转角度的函数，根据四类事件定义旋转角度
        let rotate_branch = (d, i) => {
            return direction === "top" ?
                trunk_degree + 60 / total * i :
                direction === "left" ?
                    90 + trunk_degree + 90 / total
                    : direction === "right" ?
                        -trunk_degree + 90 / total : trunk_degree + 90 / total
        }

        // 定义添加树叶图片的函数
        this.rotate_value = (d, i) => trunk_degree ? rotate_branch(d, i) : this.degree + 90 / total * i
    }

}

class LifeCircle {
    constructor(name, beginning, ending) {
        this.init(name, beginning, ending)
    }

    async init(name, beginning, ending) {
        // 定义画布svg
        this.init_tip()
        // 得到人物数据
        this.name = name 
        this.data = await get_data(this.name, beginning, ending)
        // 画生命曲线-4个圆弧

        // 获得4个阶段的位置.
        // 循环画树枝.给树枝数据
        let max_age = d3.max(this.data, d => +d.date)
        let min_age = d3.min(this.data, d => +d.date)
        let types = d3.group(this.data, d => d.type)
        let groups_by_year = d3.groups(this.data, d => d.date)
        groups_by_year.forEach((d, i) => {
            let percents = (+d[0] - min_age) / (max_age - min_age)
            d.percents = percents <= 0.25 ? "1" : percents <= 0.5 ? "2" : percents <= 0.75 ? "3" : "4"
        })
        
        // https://observablehq.com/@d3/d3-group
        // 具体流程是按照percents先分组，对于每组计算其length，也就是该组数据量
        this.year_4group = d3.rollups(groups_by_year, d => d.length, d => d.percents)
        this.init_circle()

        // 循环年份画树枝
        groups_by_year.forEach((d, i) => {
            // 获取最大年份
            let percents = (+d[0] - min_age) / (max_age - min_age)
            //获取当前年份
            // 获取百分比

            let id = i
            this.draw_branch(percents, id, d[1])
        })
        // 对右上角四类事件的legend添加交互
        this.add_event()
        // 对界面的life添加交互
        // this.add_zoom()
        this.add_annotion()

    }

    init_tip() {
        d3.select("body")
            .append("div")
            .attr("class", "d3-tip")
            .style("display", "none")
    }

    init_circle() {
        let div = d3.select('#life')
        // this.w = window.innerWidth * 0.9
        this.w = 1280 - 400
        // this.h = window.innerHeight * 0.9
        this.h = 616 * 0.9
        let svg = div.append('svg').lower()
            .attr('width', this.w)
            .attr('height', this.h)
            // .attr('transform2','translate(0,40)')
            .attr('transform', 'rotate(15)'+'translate(0,60)')
            .attr('class', 'canva')

        // 渐变色定义
        this.append_gradient_color_of_life_circlce_line(svg)
        let path = svg.append('path')

        this.year_4group.sort((a, b) => +a[0] > +b[0] ? 1 : -1)
        let total = d3.sum(this.year_4group, d => d[1])

        // T命令前必须是一个Q命令，T是Q的简写形式
        let radius = this.w * 0.8
        path.attr('d',
            `M ${this.w * 0.15}, ${this.h * 0.5}
                q ${radius * this.year_4group?.[0]?.[1] / total / 2}, ${this.h * 0.2} ${radius * this.year_4group[0][1] / total}, 0    
                t ${radius * this.year_4group?.[1]?.[1] / total}, 0
                t  ${radius * this.year_4group?.[2]?.[1] / total}, 0
                t  ${radius * this.year_4group?.[3]?.[1] / total}, 0
    `       )
            .attr('fill', 'none')
            .attr('stroke', 'url(#Gradient2)')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-width', 2)
            .attr('opacity', 0.4)

        this.path = path
        // this.add_stage(svg, radius, total)
        this.svg = svg
    }
    // 为什么function中不能直接用this.svg
    add_zoom(){
        let zoom_svg = this.svg
        zoom_svg.call(d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", zoomed))
        
        function zoomed() {
            // d3.v7中没有d3.event
            zoom_svg.attr('transform', d3.zoomTransform(this))
            }
    }

    add_stage(svg, radius, total) {

        let path_length = this.path.node().getTotalLength()
        let images = [0, 1, 2, 3, 4]
        let x = this.w * 0.15
        let max_age=d3.max(this.data, d =>+d.date)
        let min_age=d3.min(this.data, d =>+d.date)
        let stages=[1991,1998,2001,2005,2011]
        let stage_texts=[
            'Early work(1991-1997)',
            'Breakthrough(1998-2000)',
            'Worldwide recognition(2001-2004)',
            'Established actress(2005-2010)',
            'Career Expansion(2011-present)'
        ]

        images.forEach(d => {

            // 计算实际位置,按照年份计算百分比
            let percent = (stages[d] - min_age) / (max_age - min_age)
            x = radius * percent + x
            // 角度计算
            let pos = this.path.node().getPointAtLength(path_length * percent)
            let pos1 = this.path.node().getPointAtLength(path_length * percent * 0.9)
            let degree = Math.atan((pos.y - pos1.y) / (pos.x - pos1.x)) / Math.PI * 180

            // 添加图片
            let stage = svg.append('g')
                .attr('transform', `translate(${pos.x - 25},${pos.y - 25}) rotate(${degree-35} ${25} ${25} )`)
            let img_stage = stage.append('image')
                .attr('href', './img/stage.svg')
                .attr('width', 40)
                .attr('height', 40)

       /* images.forEach(d => {
            x = radius * this.year_4group?.[d]?.[1] / total + x

            let pos = this.path.node().getPointAtLength(path_length * (d + 1) * 0.25)
            let pos1 = this.path.node().getPointAtLength(path_length * (d + 1) * 0.25 * 0.95)

            let degree = Math.atan((pos.y - pos1.y) / (pos.x - pos1.x)) / Math.PI * 180
            let stage = svg.append('g')
                .attr('transform', `translate(${x - 25},${this.h * 0.5 - 25})  
                rotate(${(90 + (degree))}  25 25)`)
            stage.append('image')
                .attr('href', './img/stage.svg')
                .attr('width', 40)
                .attr('height', 40)
        })*/
        // 添加事件
        // pageX属性是鼠标指针的位置，相对于文档的左边缘。
        img_stage.on('mouseover', (e) => {
            d3.select(".d3-tip")
                .style("display", "block")
                .style("position", "absolute")
                .style("top", `${e.pageY + 10}px`)
                .style("left", `${e.pageX + 10}px`)
                .html(
                    () => `<div>  ${stage_texts[d]}  </div>`
                );
        })
            .on('mouseleave', () => {
                d3.select(".d3-tip").style("display", "none");

            })
        })
        
    }

    draw_branch(percents, id, data) {
        // 定位pos的位置，并且计算pos位置的梯度
        let path_length = this.path.node().getTotalLength()
        let pos = this.path.node().getPointAtLength(path_length * percents)
        let pos1 = this.path.node().getPointAtLength(path_length * percents * 0.9)
        let degree = Math.atan((pos.y - pos1.y) / (pos.x - pos1.x))

        let g = this.svg.append('g').attr('transform', `translate(${pos.x} , ${pos.y})  scale(6)`)
        new Tree(id, g, pos, data, degree / Math.PI * 180)
    }

    // 对右上角四类事件的legend添加交互
    // 基本明白了，至于为什么要换
    add_event() {
        let legends = d3.selectAll('.legend')
        legends.on('click', (e, d) => {
            /* 
            等于是通过改名字，来把之前的svg换成了新的svg
            这个方法感觉有点意思
            */

            let name = d3.select(e.target).attr('href')
            let last_name = name.slice(name.length - 8)
            let id = d3.select(e.target).attr('id')
            console.log(id); // id = 'relation'
            if (last_name === "open.svg") {
                // 替换legend
                d3.select(e.target).attr('href', name.replace("open.svg", 'closed.svg'))
                // 替换所有id的叶子
                d3.selectAll(`#${id}`).attr('href', name.replace("open.svg", 'closed.svg'))

            } else {
                d3.select(e.target).attr('href', name.replace("closed.svg", 'open.svg'))
                d3.selectAll(`#${id}`).attr('href', name.replace("closed.svg", 'open.svg'))
            }

        })
    }
    // 设置了 Gradient1 和 Gradient2 两个渐变色
    append_gradient_color_of_life_circlce_line(svg) {
        let defs = svg.append('defs')
        // 设置渐变，渐变1可以看出是末尾逐渐褪色的渐变
        let linearGRadient1 = defs.append('linearGradient').attr('id', 'Gradient1')
        linearGRadient1.append('stop').attr('stop-color', '#5b584a').attr('offset', '20%')
        linearGRadient1.append('stop').attr('stop-color', '#5b584a').attr('offset', '100%').attr('stop-opacity', 0.1)
        // 渐变2可以看出是开头和末尾都逐渐褪色的渐变类型
        let linearGRadient2 = defs.append('linearGradient').attr('id', 'Gradient2')
        linearGRadient2.append('stop').attr('stop-color', '#5b584a').attr('offset', '0%').attr('stop-opacity', 0.1)
        linearGRadient2.append('stop').attr('stop-color', '#5b584a').attr('offset', '15%')
        linearGRadient2.append('stop').attr('stop-color', '#5b584a').attr('offset', '85%')
        linearGRadient2.append('stop').attr('stop-color', '#5b584a').attr('offset', '100%').attr('stop-opacity', 0.1)
    }

    // 添加重要事件的可拖拽（还未弄明白原理）
    add_annotion() {
        let annotions = d3.selectAll('.annotion_path')
        annotions._groups.map(d => {
            d.forEach((v, i) => {

                let value = d3.select(v).attr('title').split('/')
                if (value[5] !== "Highlight") return
                let length = v.getTotalLength()
                let pos = v.getPointAtLength(length)

                let pos_parent = v.parentNode.parentNode.parentNode.parentNode.getBoundingClientRect()


                let div = d3.select('body').append('div').attr('class', 'annotion_container')
                    .style('position', 'absolute')
                    .style('left', (pos.x + pos_parent.x + "px"))
                    .style('top', (pos.y + pos_parent.y + (i % 2 === 0 ? -pos_parent.height / 2 : pos_parent.height / 2)) + "px")

                let icons = div.append('img')
                    .style('font-size', 2)
                    .attr('class', 'annotation-icon')
                    .attr('src', `./img/${value[2]}.svg`)

                div.append('p')
                    .style('font-size', 2)
                    .attr('class', 'annotation-title')
                    .html(value[0] +' '+ value[2]+' '+'event')

                div.append('p')
                    .style('font-size', 2)
                    .attr('class', 'annotation-text')
                    .html(value[3])

                const drag = (e, d) => {
                    div.style('left', (e.x + "px"))
                        .style('top', (e.y) + "px")

                    // 移动path
                    let d_path = d3.select(`.${value[4]}`).attr('d').replace('q', 'L')
                    d3.select(`.${value[4]}`).attr('d', d_path.split('L')[0] + ` L ${e.dx},${e.dy}`)

                }
                div.call(d3.drag().on("drag", drag));


            })
        })

    }
}

// new LifeCircle("Zhang Guimei", 1957, 2021)
// $("#person_name").change(function(){
//     d3.select('body').select('#life').select('.canva').remove();
//     d3.selectAll('.annotion_container').remove();
//     let get = $("#person_name").find("option:selected").text();
//     new LifeCircle(get)
// })
