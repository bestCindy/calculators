$(document).ready(function(){
    var inputSecurity;//社保基数
    var inputFund;//公积金基数
    var cityName;//城市名称
    var arr = [];//城市名称的数组
    var cityInfo = {};//一个城市的信息
    $.each(cityDetail,function(i,obj){
        arr[i] = obj.cityName;
    })
    addCity(sortByPinyin(arr));//城市排序
    $('#city-input').val(arr[0]);
    //点击计算
    $('#execute').click(function(){
        cityName= $('#city-input').val().trim();
        $.each(cityDetail,function(i,obj){
            if(cityDetail[i].cityName == cityName){
                cityInfo = obj;
            }
        });
        console.log(cityInfo);
        console.log(cityInfo.cityName);
        var originSalary = $('#input-origin-salary').val().trim();//基本工资
        if(originSalary != '' && cityName != ''){
            salaryCaculate(originSalary,cityInfo);
        }else{
            alert('请输入税前工资和地区！');
            return;
        }
        if(originSalary.charAt(0) == '-'){
            alert('基本工资不能为负数！');
            return;
        }
        $('#input-origin-salary').val((parseFloat(originSalary).toFixed(2)).toString());
    });
    //重置
    $('#resetInfo').click(function(){
       var citySelect = $('#city-input').val();
       $('input[type="text"]').val('');
       $('#citySelect').text(citySelect);
       $('#city-input').val(citySelect);
    });
    // 反算
    $('#executeRev').click(function(){
        var socialSecurityBase = $('#social-security-base').val().trim();
        var fundBase = $('#fund-base').val().trim();
        var cityName = $('#city-input').val().trim();
        var resultSalary = $('#input-result-salary').val().trim();
        if(resultSalary == '' || socialSecurityBase == '' || fundBase == ''){
            alert('税后收入、社保基数、公积金基数不能为空！');
            return;
        }else if(resultSalary.charAt(0) == '-' || socialSecurityBase.charAt(0) == '-' || fundBase.charAt(0) == '-'){
            alert('税后收入、社保基数、公积金基数不能为负值！');
            return;
        }
        $('#personnel-result').val(resultSalary);
        inputSecurity = socialSecurityBase;
        inputFund = fundBase;
        personnelSecCaculate(inputSecurity, inputFund, cityInfo);//个人五险一金
        orgSecCaculate(inputSecurity, inputFund, cityInfo);//公司五险一金
        // 个人缴纳五险一金总和
        var personnelSum = personnelSecCaculate(inputSecurity, inputFund, cityInfo);
        $('#personnel-sum').val(personnelSum.toString());
        //公司缴纳五险一金总和
        var orgSum = orgSecCaculate(inputSecurity, inputFund, cityInfo);
        $('#org-sum').val(orgSum.toString());
        // 税
        personnel = personnelResult;
        var orgSalary = taxCaulateRev(personnelResult,personnelSum);
        $('#input-origin-salary').val(orgSalary.toFixed(2).toString());
    });
    // 拼音排序
    function sortByPinyin(arrCity){
        arrCity.sort(function(a,b){
            return a.localeCompare(b,'zh');
        });
        return arrCity;
    }
    //设置select
    function addCity(arrCity){
        $.each(arrCity, function(i,cityVal){
            var selectNode = $('<option value =' + cityVal+' >' + cityVal + '</option>');
            $('#citySelect').append(selectNode);
        })
    }
    // 计算工资
    function salaryCaculate(originSalary, cityInfo){
        //计算社保和公积金基数
        salaryBaseCaculate(originSalary, cityInfo);
        //个人缴纳五险一金总和
        var personnelSum = personnelSecCaculate(inputSecurity, inputFund, cityInfo);
        $('#personnel-sum').val(personnelSum.toString());
        //公司缴纳五险一金总和
        var orgSum = orgSecCaculate(inputSecurity, inputFund, cityInfo);
        $('#org-sum').val(orgSum.toString());
        // 税
        var personnelResult = originSalary * 1 - personnelSum * 1;
        var taxResult = taxCaculate(personnelResult);
        taxResult = parseFloat(taxResult).toFixed(2);
        $('#tax').val(taxResult.toString());
        var salaryResult = (personnelResult * 1 - taxResult * 1);
        salaryResult = parseFloat(salaryResult).toFixed(2);
        $('#personnel-result').val(salaryResult.toString());
        $('#input-result-salary').val(salaryResult.toString());
    }
    //社保和公积金基数
    function salaryBaseCaculate(originSalary, cityInfo) {
        debugger;
        var minSecurityNum;
        var maxSecurityNum;
        var minFundNum;
        var maxFundNum;
        if($('#social-security-base').val().trim() == '' && $('#fund-base').val().trim() == '') {
            minSecurityNum = cityInfo.minSecurityNum;
            maxSecurityNum =cityInfo.maxSecurityNum;
            minFundNum = cityInfo.minFundNum;
            maxFundNum = cityInfo.maxFundNum;
            if (originSalary <= minSecurityNum) {
                inputSecurity = minSecurityNum;
            } else if (originSalary > minSecurityNum && originSalary <= maxSecurityNum) {
                inputSecurity = originSalary;
            } else if (originSalary > maxSecurityNum) {
                inputSecurity = maxSecurityNum;
            }
            if (originSalary <= minFundNum) {
                inputFund = minFundNum;
            } else if (originSalary > minFundNum && originSalary <= maxFundNum) {
                inputFund = originSalary;
            } else if (originSalary > maxFundNum) {
                inputFund = maxFundNum;
            }
        }else{
            inputSecurity = $('#social-security-base').val().trim();
            inputFund = $('#fund-base').val().trim();
        }
        $('#social-security-base').val(inputSecurity.toString());
        $('#fund-base').val(inputFund.toString());
    }
    //个人缴纳五险一金
    function personnelSecCaculate(inputSecurity, inputFund, cityInfo) {
        var personnelPension//养老保险
        var personnelPensionTax = cityInfo.personnelPensionTax;
        var personnelMedical;//医疗保险
        var personnelMedicalTax = cityInfo.personnelMedicalTax;
        var personnelVision;//失业保险
        var personnelVisionTax = cityInfo.personnelVisionTax;
        var personnelFund;//基本住房公积金
        var personnelFundTax = cityInfo.personnelFundTax;
        var personnelSum;//总和
        $('#personnel-pension-tax').val('(' + (personnelPensionTax * 100).toFixed(2).toString() + '%' + ')');
        $('#personnel-medical-tax').val('(' + (personnelMedicalTax * 100).toFixed(2).toString() + '%' + ')');
        $('#personnel-vision-tax').val('(' + (personnelVisionTax * 100).toFixed(2).toString() + '%' + ')');
        $('#personnel-fund-tax').val('(' + (personnelFundTax * 100).toFixed(2).toString() + '%' + ')');
        $('#personnel-fertility-tax').val('(0.00%)');
        $('#personnel-injury-tax').val('(0.00%)');
        //养老保险
        personnelPension = ((inputSecurity * personnelPensionTax + 1).toFixed(2) - 1).toFixed(2);
        $('#personnel-pension').val(personnelPension.toString());
        //医疗保险
        personnelMedical = ((inputSecurity * personnelMedicalTax + 1).toFixed(2) - 1).toFixed(2);
        $('#personnel-medical').val(personnelMedical.toString());
        //失业保险
        personnelVision = ((inputSecurity * personnelVisionTax + 1).toFixed(2) - 1).toFixed(2);
        $('#personnel-vision').val(personnelVision.toString());
        //基本住房公积金
        personnelFund = ((inputFund * personnelFundTax + 1).toFixed(2) - 1).toFixed(2);
        $('#personnel-fund').val(personnelFund.toString());
        //工伤保险金
        $('#personnel-injury').val('0.00');
        //生育保险金
        $('#personnel-fertility').val('0.00');
        //个人缴纳总和
        personnelSum = ((personnelPension * 1 + personnelMedical * 1 + personnelVision * 1 + personnelFund * 1 + 1).toFixed(2) - 1).toFixed(2);
        return personnelSum;
    }
    //公司缴纳五险一金
    function orgSecCaculate(inputSecurity, inputFund, cityInfo) {
        var orgPension;// 养老保险
        var orgPensionTax = cityInfo.orgPensionTax;
        var orgMedical; //医疗保险
        var orgMedicalTax = cityInfo.orgMedicalTax;
        var orgVision; //失业保险
        var orgVisionTax = cityInfo.orgVisionTax;
        var orgInjury; //工伤保险金
        var orgInjuryTax = cityInfo.orgInjuryTax;
        var orgFertility; //生育保险金
        var orgFertilityTax = cityInfo.orgFertilityTax;
        var orgFund; //基本住房公积金
        var orgFundTax = cityInfo.orgFundTax;
        var orgSum;
        $('#org-pension-tax').val('(' + (orgPensionTax * 100).toFixed(2).toString() + '%' + ')');
        $('#org-medical-tax').val('(' + (orgMedicalTax * 100).toFixed(2).toString() + '%' + ')');
        $('#org-vision-tax').val('(' + (orgVisionTax * 100).toFixed(2).toString() + '%' + ')');
        $('#org-fund-tax').val('(' + (orgFundTax * 100).toFixed(2).toString() + '%' + ')');
        $('#org-fertility-tax').val('(' + (orgFertilityTax * 100).toFixed(2).toString() + '%' + ')');
        $('#org-injury-tax').val('(' + (orgInjuryTax * 100).toFixed(2).toString() + '%' + ')');
        // 养老保险
        orgPension = ((inputSecurity * orgPensionTax + 1).toFixed(2) - 1).toFixed(2);
        $('#org-pension').val(orgPension.toString());
        //医疗保险
        orgMedical = ((inputSecurity * orgMedicalTax + 1).toFixed(2) - 1).toFixed(2);
        $('#org-medical').val(orgMedical.toString());
        //失业保险
        orgVision = ((inputSecurity * orgVisionTax + 1).toFixed(2) - 1).toFixed(2);
        $('#org-vision').val(orgVision.toString());
        //工伤保险金
        orgInjury = ((inputSecurity * orgInjuryTax + 1).toFixed(2) - 1).toFixed(2);
        $('#org-injury').val(orgInjury.toString());
        //生育保险金
        orgFertility = ((inputSecurity * orgFertilityTax + 1).toFixed(2) - 1).toFixed(2);
        $('#org-fertility').val(orgFertility.toString());
        //基本住房公积金
        orgFund = ((inputFund * orgFundTax + 1).toFixed(2) - 1).toFixed(2);
        $('#org-fund').val(orgFund.toString());
        //公司缴纳总和
        orgSum = ((orgPension * 1 + orgMedical * 1 + orgVision * 1 + orgInjury * 1 + orgFertility * 1 + orgFund * 1 + 1).toFixed(2) - 1).toFixed(2);
        return orgSum;
    }
    //税
    function taxCaculate(personnelResult) {
        var taxCaculate = personnelResult * 1 - 3500;
        var taxResult;
        if (personnelResult > 3500) {
            if (taxCaculate < 1500) {
                taxResult = (taxCaculate * 0.03).toFixed(2);
            } else if (taxCaculate >= 1500 && taxCaculate < 4500) {
                taxResult = (taxCaculate * 0.1 - 105).toFixed(2);
            } else if (taxCaculate >= 4500 && taxCaculate < 9000) {
                taxResult = (taxCaculate * 0.2 - 555).toFixed(2);
            } else if (taxCaculate >= 9000 && taxCaculate < 35000) {
                taxResult = (taxCaculate * 0.25 - 1005).toFixed(2);
            } else if (taxCaculate >= 35000 && taxCaculate < 55000) {
                taxResult = (taxCaculate * 0.3 - 2755).toFixed(2);
            } else if (taxCaculate >= 55000 && taxCaculate < 80000) {
                taxResult = (taxCaculate * 0.35 - 5505).toFixed(2);
            } else if (taxCaculate >= 80000) {
                taxResult = (taxCaculate * 0.45 - 13505).toFixed(2);
            }
        } else {
            taxResult = 0;
        }
        return taxResult;
    }
    function taxCaulateRev(personnelResult,personnelSum) {
        personnelResult = personnelResult*1;
        var tax;
        var baseNum;
        var taxResult;
        //加上税的
        if (personnelResult-45 < 5000) {
            tax = 0.03;
            baseNum = 0;
        } else if (5000 <= personnelResult-45 && personnelResult-345 < 8000) {
            tax = 0.1;
            baseNum = 105;
        } else if (8000 <= personnelResult-345 && personnelResult-1245 < 12500) {
            tax = 0.2;
            baseNum = 555;
        } else if ((12500 <= personnelResult-1245 && personnelResult-7745 < 38500)) {
            tax = 0.25;
            baseNum = 1005;
        } else if ((38500 <= personnelResult-7745 && personnelResult-13745 < 58500)) {
            tax = 0.3;
            baseNum = 2755;
        } else if ((58500 <= personnelResult-13745 && personnelResult-22495 < 83500)) {
            tax = 0.35;
            baseNum = 5505;
        } else if (personnelResult-22495 >= 83500) {
            tax = 0.45;
            baseNum = 13505;
        }else{
            tax = 0;
            baseNum = 0;
        }
        var originSalary = (personnelResult*1 - baseNum*1 - 3500*tax - personnelSum*1*tax*1)/(1 - tax);
        taxResult = ((originSalary - personnelSum - 3500) * tax - baseNum).toFixed(2).toString();
        if(taxResult.charAt(0) == '-'){
            originSalary = originSalary*1-(taxResult*1);
            taxResult = '0.00';
        }
        $('#tax').val(taxResult);
        return originSalary;
    }
    // 模糊查询部分
    $('#citySelect').change(function(){
        $('#city-input').val($('#citySelect').find('option:selected').val());
        $('#citySelect').css({'display':'none'});
        $('#city-input').val($('#citySelect').val());
    });
    $('#citySelect,#city-input').mouseover(function(){
        $('#citySelect').css({"display":"block","z-index":"10000"});
        if($('#citySelect option').length == 0){
            $('#citySelect').html('');
            for(var i=0; i<arr.length; i++){
                $('#citySelect').append($('<option></option>').text(arr[i]));
            }
            $('#citySelect').css({"display":"block","z-index":"10000"});
        }
    });
    $('#citySelect,#city-input').mouseout(function(){
        $('#citySelect').css({"display":"none","z-index":"10000"});
    });
    $('#city-input').focus(function(){
        $('#citySelect').html('');
        for(var i=0; i<arr.length; i++){
            $('#citySelect').append($('<option></option>').text(arr[i]));
        }
        $('#citySelect').css({"display":"block","z-index":"10000"});
    });
});
function setinput(thisCity) {//jq不能用input？？？
    var arr = [];
    $.ajax({
        url:'scripts/cityDetail.json',
        type:'GET',
        datatype:'JSON',
        async:false,
        success:function(result){
            $.each(result,function(i,obj){
                arr[i] = obj.cityName;
            })
        }
    })
    $('#citySelect').html('');
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].substring(0, thisCity.value.length).indexOf(thisCity.value) == 0) {
            $('#citySelect').append($('<option></option>').text(arr[i]));
        }
    }
}
