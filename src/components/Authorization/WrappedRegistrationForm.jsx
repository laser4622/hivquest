import React, {useState} from "react";
import {Link, withRouter} from 'react-router-dom';
import {
    Form,
    Input,
    Select,
    Button, Icon,
    AutoComplete, Checkbox,
    Radio,
} from 'antd';
import {useGameAction} from "../../context";
import requests from "../../requests";

const {Option} = Select;

const AutoCompleteOption = AutoComplete.Option;


const RegistrationForm = (props) => {
    const [confirmDirty, setConfirmDirty] = useState(false);
    const [autoCompleteResult, setAutoCompleteResult] = useState([]);
    const [autoCompleteIndexes, setAutoCompleteIndexes] = useState({});

    const {registration} = useGameAction();


    const {getFieldDecorator} = props.form;

    const formItemLayout = {
        labelCol: {
            xs: {span: 16},
            sm: {span: 8},
        },
        wrapperCol: {
            xs: {span: 24},
            sm: {span: 16},
        },
    };
    const tailFormItemLayout = {
        wrapperCol: {
            xs: {
                span: 24,
                offset: 0,
            },
            sm: {
                span: 16,
                offset: 8,
            },
        },
    };

    const handleSubmit = e => {
        e.preventDefault();
        props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                const changed = {
                    ucpa: values.ucpa ? 1 : 0,
                    phone: `${values.prefix}${values.phone}`
                };
                registration({...values, ...changed}, () => {
                    props.history.push('/login/')
                })
            }
        });
    };

    const handleConfirmBlur = e => {
        const {value} = e.target;
        setConfirmDirty(confirmDirty || !!value);
    };

    const compareToFirstPassword = (rule, value, callback) => {
        const {form} = props;
        if (value && value !== form.getFieldValue('pwd')) {
            callback('Пароли не совпадают!');
        } else {
            callback();
        }
    };

    const validateToNextPassword = (rule, value, callback) => {
        const {form} = props;
        if (value && confirmDirty) {
            form.validateFields(['confirm'], {force: true});
        }
        callback();
    };
    const validateUCPA = (rule, value, callback) => {
        !value ? callback('Должно быть отмеченно') : callback();
    };

    const validateAddress = (rule, value, callback) => {
        if (value && !autoCompleteResult.find(v => value === v)) {
            callback('Выберите верный');
        } else {
            callback();
        }
    };

    const validatePhone = (rule, value, callback) => {
        if (/^[0-9]+$/.test(value))
            callback();
        else
            callback('Должен содержать только цифры')
    }

    const handleAddressChange = async value => {
        let autoCompleteResult;
        let autoCompleteIndexes = {};
        if (!value || value.length < 2) {
            autoCompleteResult = [];
        } else {
            try {
                const response = await requests.cities({city: value});
                autoCompleteResult = response.data.map(d => {
                    const item = `${d.cityName}, ${d.regionName}`;
                    autoCompleteIndexes[item] = d.cityId;
                    return item;
                });
            } catch (e) {
                autoCompleteResult = [];
                console.log(e)

            }
        }
        if (autoCompleteResult.length > 0) {
            setAutoCompleteResult(autoCompleteResult);
            setAutoCompleteIndexes(autoCompleteIndexes);
        }
        console.log(autoCompleteIndexes)
        // console.log(autoCompleteResult)
    };

    const prefixSelector = getFieldDecorator('prefix', {
        initialValue: '+7',
    })(
        <Select style={{width: 70}}>
            <Option value="+7">+7</Option>
        </Select>,
    );

    const addressOptions = autoCompleteResult.map(address => (
        <AutoCompleteOption key={address}>{address}</AutoCompleteOption>
    ));


    return (
        <Form {...formItemLayout} onSubmit={handleSubmit}>

            {/*<Form.Item*/}
            {/*    label='Логин'*/}
            {/*>*/}
            {/*    {getFieldDecorator('login', {*/}
            {/*        rules: [{required: true, message: 'Please input your login!', whitespace: true}],*/}
            {/*    })(<Input/>)}*/}
            {/*</Form.Item>*/}

            <Form.Item label="E-mail">
                {getFieldDecorator('email', {
                    rules: [
                        {
                            type: 'email',
                            message: 'Введен некорректный E-mail!',
                        },
                        {
                            required: true,
                            message: 'Пожалуйста введите ваш E-mail',
                        },
                    ],
                })(<Input/>)}
            </Form.Item>

            <Form.Item label="Пароль" hasFeedback>
                {getFieldDecorator('pwd', {
                    rules: [
                        {
                            required: true,
                            message: 'Пожалуйста введите пароль!',
                        },
                        {
                            validator: validateToNextPassword,
                        },
                    ],
                })(<Input.Password/>)}
            </Form.Item>

            <Form.Item label="Подтвердите пароль" hasFeedback>
                {getFieldDecorator('confirm', {
                    rules: [
                        {
                            required: true,
                            message: 'Пожалуйста подтвердите пароль!',
                        },
                        {
                            validator: compareToFirstPassword,
                        },
                    ],
                })(<Input.Password onBlur={handleConfirmBlur}/>)}
            </Form.Item>

            <Form.Item
                label='Имя'
            >
                {getFieldDecorator('name', {
                    rules: [{required: true, message: 'Пожалуйста введите ваше имя!', whitespace: true}],
                })(<Input/>)}
            </Form.Item>

            <Form.Item
                label='Фамилия'
            >
                {getFieldDecorator('familyName', {
                    rules: [{required: true, message: 'Пожалуйста введите вашу фамилию!', whitespace: true}],
                })(<Input/>)}
            </Form.Item>

            <Form.Item
                label='Отчество'
            >
                {getFieldDecorator('patronymic', {
                    rules: [{required: true, message: 'Пожалуйста введите ваше отчество!', whitespace: true}],
                })(<Input/>)}
            </Form.Item>

            <Form.Item label="Телефон">
                {getFieldDecorator('phone', {
                    rules: [{required: true, message: 'Пожалуйста введите ваш номер телефона!'}, {
                        validator: validatePhone,
                    }],
                })(<Input addonBefore={prefixSelector} style={{width: '100%'}}/>)}
            </Form.Item>

            <Form.Item label="Пол">
                {getFieldDecorator('gender', {rules: [{required: true, message: 'Пожалуйста выберите пол!'}]})(
                    <Radio.Group>
                        <Radio.Button value={1}>Мужской</Radio.Button>
                        <Radio.Button value={0}>Женский</Radio.Button>
                    </Radio.Group>,
                )}
            </Form.Item>

            <Form.Item
                label='Ваш населённый пункт'
            >
                {getFieldDecorator('fullAddress', {
                    rules: [{required: true, message: 'Пожалуйста введите ваш населенный пункт!', whitespace: true}],
                })(<Input/>
                )}
            </Form.Item>


            <Form.Item
                label='Ваше учебное заведение'
            >
                {getFieldDecorator('educationInfo', {
                    rules: [{required: true, message: 'Пожалуйста введите ваше учебное заведение!', whitespace: true}],
                })(<Input/>)}
            </Form.Item>

            <Form.Item {...tailFormItemLayout}>
                {getFieldDecorator('ucpa', {
                    rules: [{
                        validator: validateUCPA,
                    }],
                    valuePropName: 'checked',
                })(
                    <Checkbox style={{color:'#ffe45a'}}>
                        Я согласен с <Link to="/registration/s/" target="_blank">условиями</Link>
                    </Checkbox>,
                )}
            </Form.Item>

            <Form.Item {...tailFormItemLayout}>
                <div>
                    <Button type="primary" style={{marginRight: '1vw'}} onClick={() => props.history.push('/login/')}>
                        <Icon type="arrow-left"/>
                        Вход
                    </Button>

                    <Button htmlType="submit">
                        Зарегистрироваться
                    </Button>
                </div>
            </Form.Item>
        </Form>
    )
};


const WrappedRegistrationForm = withRouter(Form.create({name: 'register'})(RegistrationForm));

export default WrappedRegistrationForm